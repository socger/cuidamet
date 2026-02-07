import React, { useState, useEffect } from "react";
import { CareCategory, Provider, ChatConversation, Message, UserRole, BookingDetails, ClientProfile, ProviderProfile, ServiceDescription } from "./types";
import { MOCK_PROVIDERS } from "./services/mockData";
import { MOCK_CHATS } from "./services/mockChatData";
import BottomNav from "./components/BottomNav";
import LandingPage from "./components/LandingPage";
import ProfileDetail from "./components/ProfileDetail";
import ProfesionalRegistration from "./components/profiles/createProfile/ProfesionalRegistration";
import Inbox from "./components/Inbox";
import Chat from "./components/Chat";
import FamiliarProfilePage from "./components/profiles/profilePage/FamiliarProfilePage";
import MapView from "./components/MapView";
import CookieConsent from "./components/CookieConsent";
import ProvidersList from "./components/ProvidersList";
import AuthPage from "./components/AuthPage";
import BookingPage from "./components/booking/BookingPage";
import BookingsList from "./components/booking/BookingsList";
import { bookingService } from "./services/bookingService";
import AlertModal from "./components/actions/AlertModal";
import ProfileLandingPage from "./components/ProfileLandingPage";
import RoleSelection from "./components/RoleSelection";
import FamiliarRegistration from "./components/profiles/createProfile/FamiliarRegistration";
import ProfesionalProfilePage from "./components/profiles/profilePage/ProfesionalProfilePage";
import SupportChatPage from "./components/support/SupportChatPage";
import SupportPage from "./components/support/SupportPage";
import SupportEmailPage from "./components/support/SupportEmailPage";
import LegalInfoPage from "./components/legalinfo/LegalInfoPage";
import LegalDocumentPage from "./components/legalinfo/LegalDocumentPage";
import { legalDocuments } from "./components/legalinfo/legalContent";
import NotificationsPage from "./components/NotificationsPage";
import SecuritySettingsPage from "./components/SecuritySettingsPage";
import { authService, tokenStorage } from "./services/authService";
import { clientProfileService, providerProfileService, serviceConfigService } from "./services/profileService";
import defaultUserAvatar from "./resources/images/default-user-avatar.jpg";

const getDistanceInKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

const App: React.FC = () => {
  const [view, setView] = useState<
    | "landing"
    | "providers"
    | "profile"
    | "offer"
    | "inbox"
    | "chat"
    | "myProfile"
    | "map"
    | "auth"
    | "booking"
    | "bookings"
    | "roleSelection"
    | "familiarRegistration"
    | "profesionalRegistration"
    | "securitySettings"
    | "notifications"
    | "legalInfo"
    | "supportChat"
    | "support"
    | "supportEmail"
    | "legalDocument"
  >("landing");
  const [previousView, setPreviousView] = useState<
    "providers" | "map"
  >("providers");
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<
    CareCategory | "all"
  >("all");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chats, setChats] = useState<ChatConversation[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [selectedLegalDocId, setSelectedLegalDocId] = useState<string | null>(
    null
  );
  const [previousViewBeforeChat, setPreviousViewBeforeChat] = useState<typeof view>("inbox");

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [previousViewBeforeAuth, setPreviousViewBeforeAuth] = useState<typeof view>("landing");
  const [authAttempts, setAuthAttempts] = useState<number>(0);
  const [pendingAction, setPendingAction] = useState<'booking' | 'favorite' | 'bookings' | 'chat' | 'inbox' | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [preselectedRole, setPreselectedRole] = useState<UserRole | undefined>(undefined);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [activeRole, setActiveRole] = useState<'client' | 'provider'>('client');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userFirstName, setUserFirstName] = useState<string>('');
  const [userLastName, setUserLastName] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  
  // Booking state
  const [bookingProviderId, setBookingProviderId] = useState<number | null>(null);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [cloningBookingId, setCloningBookingId] = useState<string | null>(null);
  
  // Alert Modal state
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; title?: string }>({ isOpen: false, message: '' });
  
  // Favorites filter state (when navigating from FamiliarProfilePage)
  const [showFavoritesFromProfile, setShowFavoritesFromProfile] = useState<boolean>(false);

  // Verificar si hay una sesión activa al cargar la app
  useEffect(() => {
    const checkAuthStatus = async () => {
      const hasToken = authService.isAuthenticated();
      if (hasToken) {
        try {
          const user = tokenStorage.getUser();
          const role = tokenStorage.getUserRole();
          
          if (user && role) {
            setIsAuthenticated(true);
            setUserEmail(user.email);
            setUserFirstName(user.firstName || '');
            setUserLastName(user.lastName || '');
            
            // Cargar AMBOS perfiles para determinar cuál existe
            console.log('🔍 Intentando cargar perfiles para user:', user.id);
            
            let loadedProviderProfile = null;
            let loadedClientProfile = null;
            
            // Intentar cargar perfil profesional
            try {
              const response = await providerProfileService.getByUserId(user.id);
              const profile = response.data;
              console.log('✅ Perfil profesional encontrado:', profile);
              
              let servicesMap = {};
              try {
                console.log('📦 Cargando servicios del proveedor:', profile.id);
                const servicesResponse = await serviceConfigService.getByProviderId(profile.id);
                console.log('✅ Servicios cargados:', servicesResponse);
                
                if (servicesResponse.data && Array.isArray(servicesResponse.data)) {
                  servicesMap = servicesResponse.data.reduce((acc: any, service: any) => {
                    const variations = service.variations && Array.isArray(service.variations)
                      ? service.variations.map((v: any) => ({
                          id: v.id,
                          name: v.name,
                          price: parseFloat(v.price) || 0,
                          unit: v.unit,
                          enabled: v.enabled,
                          description: v.description || '',
                          isCustom: v.isCustom || false,
                          displayOrder: v.displayOrder || 0,
                        }))
                      : [];
                    
                    acc[service.careCategory] = {
                      id: service.id,
                      completed: service.completed,
                      tasks: service.tasks || [],
                      availability: service.availability || [],
                      rates: {
                        hourly: parseFloat(service.hourlyRate) || 0,
                        shift: service.shiftRate ? parseFloat(service.shiftRate) : undefined,
                        urgentSurcharge: service.urgentSurcharge ? parseFloat(service.urgentSurcharge) : undefined,
                      },
                      description: service.description || '',
                      variations: variations,
                    };
                    return acc;
                  }, {});
                  console.log('🗺️ Servicios mapeados:', servicesMap);
                }
              } catch (error) {
                console.warn('⚠️ Sin servicios configurados:', error);
              }
              
              loadedProviderProfile = {
                id: profile.id,
                firstName: profile.user?.firstName || user.firstName || '',
                lastName: profile.user?.lastName || user.lastName || '',
                email: profile.user?.email || user.email,
                phone: profile.user?.phone || '',
                photoUrl: profile.user?.photoUrl || '',
                location: profile.user?.location || '',
                coordinates: profile.user?.latitude && profile.user?.longitude 
                  ? { latitude: parseFloat(profile.user.latitude), longitude: parseFloat(profile.user.longitude) }
                  : undefined,
                languages: profile.user?.languages || [],
                availability: profile.availability || [],
                services: servicesMap,
              };
              
              setProviderProfile(loadedProviderProfile);
            } catch (error) {
              console.log('ℹ️ No existe perfil profesional');
            }
            
            // Intentar cargar perfil familiar
            try {
              const profile = await clientProfileService.getByUserId(user.id);
              console.log('✅ Perfil familiar encontrado:', profile);
              
              loadedClientProfile = {
                id: profile.id,
                firstName: profile.user?.firstName || user.firstName || '',
                lastName: profile.user?.lastName || user.lastName || '',
                email: profile.user?.email || user.email,
                phone: profile.user?.phone || '',
                photoUrl: profile.user?.photoUrl || '',
                location: profile.user?.location || '',
                coordinates: profile.user?.latitude && profile.user?.longitude 
                  ? { latitude: parseFloat(profile.user.latitude), longitude: parseFloat(profile.user.longitude) }
                  : undefined,
                languages: profile.user?.languages || [],
                preferences: profile.preferences || [],
              };
              
              setClientProfile(loadedClientProfile);
            } catch (error) {
              console.log('ℹ️ No existe perfil familiar');
            }
            
            // Determinar activeRole basándose en los perfiles que existen
            if (loadedProviderProfile && !loadedClientProfile) {
              console.log('🔵 Solo perfil profesional, activeRole=provider');
              setActiveRole('provider');
            } else if (loadedClientProfile && !loadedProviderProfile) {
              console.log('🟢 Solo perfil familiar, activeRole=client');
              setActiveRole('client');
            } else if (loadedProviderProfile && loadedClientProfile) {
              console.log('🟡 Ambos perfiles, usando rol del token:', role);
              setActiveRole(role === 'provider' ? 'provider' : 'client');
            } else {
              console.log('⚪ Sin perfiles, usando rol del token:', role);
              setActiveRole(role === 'provider' ? 'provider' : 'client');
            }
          } else {
            // Token existe pero no hay datos de usuario, limpiar
            tokenStorage.clearTokens();
          }
        } catch (error) {
          console.error('Error al verificar sesión:', error);
          tokenStorage.clearTokens();
        }
      }
    };
    
    checkAuthStatus();
  }, []);

  useEffect(() => {
    // Simulate fetching data
    setIsLoading(true);
    setTimeout(() => {
      setProviders(MOCK_PROVIDERS);
      setChats(MOCK_CHATS);
      setIsLoading(false);
    }, 1500);

    // Only check for geolocation support, don't request it on load
    if (!navigator.geolocation) {
      setLocationError("La geolocalización no es compatible con tu navegador.");
    }
  }, []);

  // Reset favorites filter when leaving providers view
  useEffect(() => {
    if (view !== "providers") {
      setShowFavoritesFromProfile(false);
    }
  }, [view]);

  const unreadCount = chats.reduce((count, chat) => {
    return (
      count +
      chat.messages.filter((m) => m.sender === "other" && !m.read).length
    );
  }, 0);

  const handleToggleFavorite = (providerId: number) => {
    if (!isAuthenticated) {
      setPreviousViewBeforeAuth(view);
      setPendingAction('favorite');
      setAuthAttempts(0);
      setAuthMode('login');
      setPreselectedRole(undefined);
      setView("auth");
      return;
    }
    setFavorites((prevFavorites) => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(providerId)) {
        newFavorites.delete(providerId);
      } else {
        newFavorites.add(providerId);
      }
      return newFavorites;
    });
  };

  const handleCategorySelect = (category: CareCategory) => {
    setSelectedCategory(category);
    setView("providers");
  };

  const handleShowAll = (category: CareCategory | "all") => {
    setSelectedCategory(category);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query.trim());
    setSelectedCategory("all");
    setView("providers");
  };

  const handleNavigateHome = () => {
    setView("landing");
    setSelectedProviderId(null);
    setCurrentChatId(null);
  };

  const handleShowAllProviders = () => {
    setSelectedCategory("all");
    setView("providers");
  };

  const handleNavigateMap = () => {
    setView("map");
    setSelectedProviderId(null);
    setCurrentChatId(null);
  };

  const handleNavigateFavorites = () => {
    setShowFavoritesFromProfile(true);
    setSelectedCategory("all");
    setSearchQuery("");
    setView("providers");
    setSelectedProviderId(null);
    setCurrentChatId(null);
  };

  const handleNavigateBookings = () => {
    if (!isAuthenticated) {
      setPreviousViewBeforeAuth(view);
      setPendingAction('bookings');
      setAuthAttempts(0);
      setAuthMode('login');
      setPreselectedRole(undefined);
      setView("auth");
      return;
    }
    setView("bookings");
    setSelectedProviderId(null);
    setCurrentChatId(null);
  };

  const handleNavigateInbox = () => {
    if (!isAuthenticated) {
      setPreviousViewBeforeAuth(view);
      setPendingAction('inbox');
      setAuthAttempts(0);
      setAuthMode('login');
      setPreselectedRole(undefined);
      setView("auth");
      return;
    }
    setView("inbox");
    setSelectedProviderId(null);
    setCurrentChatId(null);
  };

  const handleNavigateOffer = () => {
    if (!isAuthenticated) {
      setPreviousViewBeforeAuth(view);
      setPendingAction(null);
      setAuthAttempts(0);
      setAuthMode('login');
      setPreselectedRole('provider');
      setView("auth");
      return;
    }
    setView("offer");
    setSelectedProviderId(null);
    setCurrentChatId(null);
  };

  const handleProviderRegistrationComplete = async (data: ProviderProfile, deletedCertificateIds: number[]) => {
    console.log('🔵 [APP.TSX] handleProviderRegistrationComplete iniciado');
    console.log('🔵 [APP.TSX] deletedCertificateIds recibidos:', deletedCertificateIds);
    console.log('🔵 [APP.TSX] typeof deletedCertificateIds:', typeof deletedCertificateIds);
    console.log('🔵 [APP.TSX] Array.isArray(deletedCertificateIds):', Array.isArray(deletedCertificateIds));
    try {
      // Obtener el userId del usuario autenticado
      const user = tokenStorage.getUser();
      if (!user || !user.id) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      // Preparar datos del usuario para actualizar
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      };

      // Preparar datos para la API
      const createProviderDto = {
        userId: user.id,
        phone: data.phone,
        photoUrl: data.photoUrl,
        location: data.location,
        latitude: data.coordinates?.latitude,
        longitude: data.coordinates?.longitude,
        languages: data.languages,
        availability: data.availability,
        profileStatus: 'published', // Perfil publicado al completar el registro
        // Los servicios se guardarán a través de service-configs y service-variations endpoints
      };

      // Guardar el perfil en la base de datos (también actualiza datos del usuario)
      const savedProfile = await providerProfileService.create(createProviderDto, userData);
      
      // Actualizar el estado local con el perfil guardado (incluye el id)
      setProviderProfile({ ...data, id: savedProfile.id });
      setActiveRole('provider');
      setIsAuthenticated(true);
      
      // Show success alert
      setAlertModal({ 
        isOpen: true, 
        message: '¡Tu perfil profesional se ha creado exitosamente! Ahora los clientes podrán encontrarte.', 
        title: 'Perfil publicado' 
      });
      
      // Navigate to myProfile view after a short delay
      setTimeout(() => {
        setView("myProfile");
      }, 2000);
    } catch (error: any) {
      console.error('Error al guardar perfil de proveedor:', error);
      setAlertModal({ 
        isOpen: true, 
        message: error.message || 'Error al guardar el perfil. Por favor, intenta de nuevo.', 
        title: 'Error' 
      });
    }
  };

  const handleUpdateProviderProfile = async (updatedProfile: ProviderProfile, deletedCertificateIds: number[]) => {
    console.log('🔵 [APP.TSX] handleUpdateProviderProfile iniciado');
    console.log('🔵 [APP.TSX] updatedProfile recibido:', JSON.stringify(updatedProfile, null, 2));
    console.log('🔵 [APP.TSX] deletedCertificateIds recibidos:', deletedCertificateIds);
    console.log('🔵 [APP.TSX] typeof deletedCertificateIds:', typeof deletedCertificateIds);
    console.log('🔵 [APP.TSX] Array.isArray(deletedCertificateIds):', Array.isArray(deletedCertificateIds));
    console.log('🔵 [APP.TSX] updatedProfile.services:', updatedProfile.services);
    
    // Verificar si hay certificados en los servicios
    if (updatedProfile.services) {
      Object.entries(updatedProfile.services).forEach(([key, service]) => {
        if (service.certificates && service.certificates.length > 0) {
          console.log(`🔵 [APP.TSX] Servicio "${key}" tiene ${service.certificates.length} certificados:`, service.certificates);
        } else {
          console.log(`🔵 [APP.TSX] Servicio "${key}" NO tiene certificados`);
        }
      });
    }
    
    try {
      if (!updatedProfile.id) {
        throw new Error('No se puede actualizar el perfil sin ID');
      }

      // Obtener el userId del usuario autenticado
      const user = tokenStorage.getUser();
      if (!user || !user.id) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      console.log('💾 Actualizando perfil de proveedor:', updatedProfile);
      console.log('🎯 Servicios a guardar:', updatedProfile.services);

      // Preparar datos del usuario para actualizar
      const userData = {
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        email: updatedProfile.email,
      };

      // Preparar datos para actualizar
      const updateDto = {
        userId: user.id,
        phone: updatedProfile.phone,
        photoUrl: updatedProfile.photoUrl,
        location: updatedProfile.location,
        latitude: updatedProfile.coordinates?.latitude,
        longitude: updatedProfile.coordinates?.longitude,
        languages: updatedProfile.languages,
        availability: updatedProfile.availability,
      };

      // Actualizar perfil básico (también actualiza datos del usuario)
      await providerProfileService.update(updatedProfile.id, updateDto, userData);
      
      // Guardar servicios si existen
      if (updatedProfile.services && Object.keys(updatedProfile.services).length > 0) {
        console.log('📝 Guardando servicios del proveedor...');
        console.log('🗑️ [APP.TSX] Pasando deletedCertificateIds a saveProviderServices:', deletedCertificateIds);
        await serviceConfigService.saveProviderServices(updatedProfile.id, updatedProfile.services, deletedCertificateIds);
        console.log('✅ Servicios guardados correctamente');
      }
      
      // Actualizar estado local
      setProviderProfile(updatedProfile);
      
      // Show success message
      setAlertModal({
        isOpen: true,
        message: 'Perfil y servicios actualizados correctamente',
        title: 'Éxito'
      });
    } catch (error: any) {
      console.error('Error al actualizar perfil de proveedor:', error);
      setAlertModal({
        isOpen: true,
        message: error.message || 'Error al actualizar el perfil. Por favor, intenta de nuevo.',
        title: 'Error'
      });
    }
  };

  const handleUpdateClientProfile = async (updatedProfile: ClientProfile) => {
    try {
      if (!updatedProfile.id) {
        throw new Error('No se puede actualizar el perfil sin ID');
      }

      // Obtener el userId del usuario autenticado
      const user = tokenStorage.getUser();
      if (!user || !user.id) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      // Preparar datos del usuario para actualizar
      const userData = {
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        email: updatedProfile.email,
      };

      // Preparar datos para actualizar
      const updateDto = {
        userId: user.id,
        phone: updatedProfile.phone,
        photoUrl: updatedProfile.photoUrl,
        location: updatedProfile.location,
        latitude: updatedProfile.coordinates?.latitude,
        longitude: updatedProfile.coordinates?.longitude,
        languages: updatedProfile.languages,
        preferences: updatedProfile.preferences,
      };

      // Actualizar en la base de datos (también actualiza datos del usuario)
      await clientProfileService.update(updatedProfile.id, updateDto, userData);
      
      // Actualizar estado local
      setClientProfile(updatedProfile);
      
      // Show success message
      setAlertModal({
        isOpen: true,
        message: 'Perfil actualizado correctamente',
        title: 'Éxito'
      });
    } catch (error: any) {
      console.error('Error al actualizar perfil de cliente:', error);
      setAlertModal({
        isOpen: true,
        message: error.message || 'Error al actualizar el perfil. Por favor, intenta de nuevo.',
        title: 'Error'
      });
    }
  };

  const handleNavigateMyProfile = () => {
    setView("myProfile");
    setSelectedProviderId(null);
    setCurrentChatId(null);
  };

  const handleViewProfile = (providerId: number) => {
    if (view === "providers" || view === "map") {
      setPreviousView(view);
    }
    setSelectedProviderId(providerId);
    setView("profile");
  };

  const handleBackToList = () => {
    setView(previousView);
    setSelectedProviderId(null);
  };

  const handleBackFromChat = () => {
    setView(previousViewBeforeChat);
    setCurrentChatId(null);
  };

  const handleViewChat = (chatId: number) => {
    // Save current view before going to chat
    setPreviousViewBeforeChat(view);
    // Mark messages as read
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: chat.messages.map((m) => ({ ...m, read: true })),
          };
        }
        return chat;
      })
    );
    setCurrentChatId(chatId);
    setView("chat");
  };

  const handleContactProvider = (providerId: number) => {
    // Check authentication first
    if (!isAuthenticated) {
      setPreviousViewBeforeAuth(view);
      setPendingAction('chat');
      setBookingProviderId(providerId); // Reuse this state to store the provider ID
      setAuthAttempts(0);
      setAuthMode('login');
      setPreselectedRole(undefined);
      setView("auth");
      return;
    }

    handleContactProviderAfterAuth(providerId);
  };

  const handleContactProviderAfterAuth = (providerId: number) => {
    // Use the view before auth as the previous view for chat
    const viewToReturn = previousViewBeforeAuth;
    
    const existingChat = chats.find((chat) => chat.provider && chat.provider.id === providerId);
    if (existingChat) {
      // Set the correct previous view before calling handleViewChat
      setPreviousViewBeforeChat(viewToReturn);
      // Mark messages as read and navigate to chat
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === existingChat.id) {
            return {
              ...chat,
              messages: chat.messages.map((m) => ({ ...m, read: true })),
            };
          }
          return chat;
        })
      );
      setCurrentChatId(existingChat.id);
      setView("chat");
    } else {
      const provider = providers.find((p) => p.id === providerId);
      if (provider) {
        const newChat: ChatConversation = {
          id: chats.length + 1,
          provider,
          messages: [],
        };
        setChats((prevChats) => [...prevChats, newChat]);
        setPreviousViewBeforeChat(viewToReturn);
        setCurrentChatId(newChat.id);
        setView("chat");
      }
    }
  };

  const handleSendMessage = (chatId: number, text: string) => {
    const newMessage: Message = {
      id: Date.now(),
      text,
      sender: "me",
      timestamp: new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: true,
    };

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
          };
        }
        return chat;
      })
    );
  };

  const handleLoginSuccess = async (role: UserRole) => {
    console.log('🎉 handleLoginSuccess llamado con role:', role);
    setIsAuthenticated(true);
    setAuthAttempts(0);
    
    // Cargar AMBOS perfiles independientemente del rol para determinar cuál existe
    const user = tokenStorage.getUser();
    if (user) {
      console.log('📥 Cargando perfiles para user:', user.id);
      
      // Actualizar estados locales con los datos del usuario autenticado
      setUserEmail(user.email);
      setUserFirstName(user.firstName || '');
      setUserLastName(user.lastName || '');
      setUserPhone(user.phone || '');
      
      let loadedProviderProfile = null;
      let loadedClientProfile = null;
      
      // Intentar cargar perfil profesional
      try {
        const response = await providerProfileService.getByUserId(user.id);
        const profile = response.data;
        console.log('✅ Perfil profesional encontrado:', profile);
        
        // Cargar servicios del proveedor
        let servicesMap = {};
        try {
          console.log('📦 Cargando servicios del proveedor:', profile.id);
          const servicesResponse = await serviceConfigService.getByProviderId(profile.id);
          console.log('✅ Servicios cargados:', servicesResponse);
          
          // Transformar array de ServiceConfigs a objeto por categoría
          if (servicesResponse.data && Array.isArray(servicesResponse.data)) {
            servicesMap = servicesResponse.data.reduce((acc: any, service: any) => {
              const variations = service.variations && Array.isArray(service.variations)
                ? service.variations.map((v: any) => ({
                    id: v.id,
                    name: v.name,
                    price: parseFloat(v.price) || 0,
                    unit: v.unit,
                    enabled: v.enabled,
                    description: v.description || '',
                    isCustom: v.isCustom || false,
                    displayOrder: v.displayOrder || 0,
                  }))
                : [];
              
              const certificates = service.certificates && Array.isArray(service.certificates)
                ? service.certificates.map((cert: any) => ({
                    id: cert.id,
                    name: cert.name,
                    contactInfo: cert.contactInfo || '',
                    description: cert.description || '',
                    type: cert.certificateType || 'other',
                    fileName: cert.fileName,
                    fileUrl: cert.fileUrl,
                    status: cert.verificationStatus || 'pending',
                    dateAdded: cert.createdAt,
                  }))
                : [];
              
              acc[service.careCategory] = {
                id: service.id,
                completed: service.completed,
                tasks: service.tasks || [],
                availability: service.availability || [],
                rates: {
                  hourly: parseFloat(service.hourlyRate) || 0,
                  shift: service.shiftRate ? parseFloat(service.shiftRate) : undefined,
                  urgentSurcharge: service.urgentSurcharge ? parseFloat(service.urgentSurcharge) : undefined,
                },
                description: service.description || '',
                variations: variations,
                certificates: certificates,
              };
              return acc;
            }, {});
            console.log('🗺️ Servicios mapeados:', servicesMap);
          }
        } catch (error) {
          console.warn('⚠️ Sin servicios configurados:', error);
        }
        
        loadedProviderProfile = {
          id: profile.id,
          firstName: profile.user?.firstName || user.firstName || '',
          lastName: profile.user?.lastName || user.lastName || '',
          email: profile.user?.email || user.email,
          phone: profile.user?.phone || '',
          photoUrl: profile.user?.photoUrl || '',
          location: profile.user?.location || '',
          coordinates: profile.user?.latitude && profile.user?.longitude 
            ? { latitude: parseFloat(profile.user.latitude), longitude: parseFloat(profile.user.longitude) }
            : undefined,
          languages: profile.user?.languages || [],
          availability: profile.availability || [],
          services: servicesMap,
        };
        
        setProviderProfile(loadedProviderProfile);
      } catch (error) {
        console.log('ℹ️ No existe perfil profesional');
      }
      
      // Intentar cargar perfil familiar
      try {
        const profile = await clientProfileService.getByUserId(user.id);
        console.log('✅ Perfil familiar encontrado:', profile);
        
        loadedClientProfile = {
          id: profile.id,
          firstName: profile.user?.firstName || user.firstName || '',
          lastName: profile.user?.lastName || user.lastName || '',
          email: profile.user?.email || user.email,
          phone: profile.user?.phone || '',
          photoUrl: profile.user?.photoUrl || '',
          location: profile.user?.location || '',
          coordinates: profile.user?.latitude && profile.user?.longitude 
            ? { latitude: parseFloat(profile.user.latitude), longitude: parseFloat(profile.user.longitude) }
            : undefined,
          languages: profile.user?.languages || [],
          preferences: profile.preferences || [],
        };
        
        setClientProfile(loadedClientProfile);
      } catch (error) {
        console.log('ℹ️ No existe perfil familiar');
      }
      
      // Determinar activeRole basándose en los perfiles que existen
      if (loadedProviderProfile && !loadedClientProfile) {
        console.log('🔵 Solo existe perfil profesional, estableciendo activeRole=provider');
        setActiveRole('provider');
      } else if (loadedClientProfile && !loadedProviderProfile) {
        console.log('🟢 Solo existe perfil familiar, estableciendo activeRole=client');
        setActiveRole('client');
      } else if (loadedProviderProfile && loadedClientProfile) {
        // Si existen ambos, usar el rol proporcionado por el backend
        console.log('🟡 Existen ambos perfiles, usando rol del backend:', role);
        setActiveRole(role);
      } else {
        // Si no existe ningún perfil, usar el rol proporcionado por el backend
        console.log('⚪ No existe ningún perfil, usando rol del backend:', role);
        setActiveRole(role);
      }
    }
    
    // Execute pending action
    if (pendingAction === 'booking' && bookingProviderId) {
      setView('booking');
    } else if (pendingAction === 'bookings') {
      setView('bookings');
    } else if (pendingAction === 'inbox') {
      setView('inbox');
    } else if (pendingAction === 'chat' && bookingProviderId) {
      // Use bookingProviderId which stores the provider ID for chat
      handleContactProviderAfterAuth(bookingProviderId);
    } else {
      setView(previousViewBeforeAuth);
    }
    setPendingAction(null);
  };

  const handleSignupSuccess = async (role: UserRole, email: string) => {
    setIsAuthenticated(true);
    setAuthAttempts(0);
    setUserEmail(email);
    
    // Obtener los datos del usuario registrado (firstName, lastName) del token
    try {
      const user = tokenStorage.getUser();
      if (user) {
        // Guardar firstName y lastName del usuario para pre-rellenar formularios
        setUserFirstName(user.firstName || '');
        setUserLastName(user.lastName || '');
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      // No bloquear el flujo si falla
    }
    
    // After signup, always redirect to registration flow first (regardless of pending action)
    // The user needs to complete their profile before accessing other features
    if (role === 'client') {
      setActiveRole('client');
      setView('familiarRegistration');
      setPendingAction(null);
      return;
    }
    
    if (role === 'provider') {
      setActiveRole('provider');
      setView('profesionalRegistration');
      setPendingAction(null);
      return;
    }
    
    // Fallback (shouldn't reach here normally)
    setView(previousViewBeforeAuth);
    setPendingAction(null);
  };

  const handleAuthBack = () => {
    setView(previousViewBeforeAuth);
    setPendingAction(null);
    setBookingProviderId(null);
    setAuthAttempts(0);
  };
  
  const handleAuthMaxAttempts = () => {
    setAuthAttempts(0);
    setPendingAction(null);
    setBookingProviderId(null);
    setView(previousViewBeforeAuth);
  };
  
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    setIsAuthenticated(false);
    setClientProfile(null);
    setProviderProfile(null);
    setView("landing");
  };
  
  const handleCancelFamiliarRegistration = () => {
    // NO revertir el estado de autenticación porque el usuario ya está creado en BD
    // Solo limpiar el perfil del cliente local
    setClientProfile(null);
    // Return to role selection view para que pueda elegir crear perfil de nuevo
    setView('roleSelection');
  };
  
  const handleCancelProfesionalRegistration = () => {
    // NO revertir el estado de autenticación porque el usuario ya está creado en BD
    // Solo limpiar el perfil del proveedor local
    setProviderProfile(null);
    // Return to role selection view para que pueda elegir crear perfil de nuevo
    setView('roleSelection');
  };
  
  const handleBookNow = (providerId: number) => {
    if (!isAuthenticated) {
      setPreviousViewBeforeAuth(view);
      setPendingAction('booking');
      setBookingProviderId(providerId);
      setAuthAttempts(0);
      setAuthMode('login');
      setPreselectedRole(undefined);
      setView("auth");
      return;
    }
    
    setBookingProviderId(providerId);
    setView('booking');
  };
  
  const handleBookingBack = () => {
    setView('profile');
    setBookingProviderId(null);
    setEditingBookingId(null);
    setCloningBookingId(null);
  };
  
  const handleEditBooking = (bookingId: string) => {
    const booking = bookingService.getBookingById(bookingId);
    if (booking) {
      setBookingProviderId(booking.providerId);
      setEditingBookingId(bookingId);
      setView('booking');
    }
  };
  
  const handleCloneBooking = (bookingId: string) => {
    const booking = bookingService.getBookingById(bookingId);
    if (booking) {
      setBookingProviderId(booking.providerId);
      setEditingBookingId(null); // No estamos editando, estamos creando una nueva
      setCloningBookingId(bookingId); // Guardamos el ID de la reserva que estamos clonando
      setView('booking');
    }
  };
  
  const handleBookingProceed = (details: BookingDetails) => {
    // Here you would normally process the payment
    console.log('Booking details:', details);
    
    if (editingBookingId) {
      // Update existing booking
      bookingService.updateBooking(editingBookingId, details);
      setAlertModal({ isOpen: true, message: `Reserva actualizada: ${details.hours} horas por ${details.totalCost}€`, title: 'Reserva Actualizada' });
      setEditingBookingId(null);
    } else {
      // Create new booking (incluye las clonadas)
      const provider = providers.find(p => p.id === details.providerId);
      if (provider) {
        bookingService.addBooking(details, provider.name, provider.photoUrl);
      }
      const message = cloningBookingId 
        ? `Reserva duplicada y confirmada: ${details.hours} horas por ${details.totalCost}€`
        : `Reserva confirmada para ${details.hours} horas por ${details.totalCost}€`;
      setAlertModal({ isOpen: true, message, title: 'Reserva Confirmada' });
      setCloningBookingId(null);
    }
    
    setView('bookings'); // Navigate to bookings list
    setBookingProviderId(null);
  };

  const renderContent = () => {
    const providersWithDistance = userLocation
      ? providers.map((p) => ({
          ...p,
          distance: getDistanceInKm(
            userLocation.latitude,
            userLocation.longitude,
            p.coordinates.latitude,
            p.coordinates.longitude
          ),
        }))
      : providers;

    // Determine which view to render (excluding auth since it's an overlay)
    const currentView = view === "auth" ? previousViewBeforeAuth : view;

    let mainContent = null;

    if (currentView === "map") {
      mainContent = (
        <MapView
          providers={providersWithDistance}
          userLocation={userLocation}
          onViewProfile={handleViewProfile}
          onBack={handleNavigateHome}
          onLocationUpdate={setUserLocation}
          onLocationLoading={setIsLocationLoading}
          onLocationError={setLocationError}
          currentUserPhotoUrl={undefined}
        />
      );
    } else if (currentView === "offer") {
      mainContent = <ProfesionalRegistration 
        initialData={clientProfile ? {
          ...clientProfile,
          // Convertir clientProfile a estructura compatible con ProviderProfile
          firstName: clientProfile.firstName,
          lastName: clientProfile.lastName,
          email: userEmail || clientProfile.email,
          phone: clientProfile.phone,
          location: clientProfile.location,
          languages: clientProfile.languages,
        } : {
          firstName: userFirstName,
          lastName: userLastName,
          email: userEmail,
          phone: userPhone,
        }}
        onComplete={handleProviderRegistrationComplete}
        onCancel={handleCancelProfesionalRegistration}
        currentView={view}
        onNavigateHome={handleNavigateHome}
        onNavigateFavorites={handleNavigateFavorites}
        onNavigateOffer={handleNavigateOffer}
        onNavigateInbox={handleNavigateInbox}
        onNavigateProfile={handleNavigateMyProfile}
        onNavigateBookings={handleNavigateBookings}
        unreadCount={unreadCount}
        isAuthenticated={isAuthenticated}
        initialStep={2}
      />;
    } else if (currentView === "booking" && bookingProviderId) {
      const provider = providersWithDistance.find(
        (p) => p.id === bookingProviderId
      );
      if (provider) {
        const editingBooking = editingBookingId ? bookingService.getBookingById(editingBookingId) : null;
        const cloningBooking = cloningBookingId ? bookingService.getBookingById(cloningBookingId) : null;
        const sourceBooking = editingBooking || cloningBooking;
        
        mainContent = (
          <BookingPage
            provider={provider}
            onBack={handleBookingBack}
            onProceed={handleBookingProceed}
            isEditing={!!editingBookingId}
            userRole={activeRole}
            initialBooking={sourceBooking ? {
              startDate: sourceBooking.startDate,
              startTime: sourceBooking.startTime,
              endDate: sourceBooking.endDate,
              endTime: sourceBooking.endTime,
              promoCode: '',
              addInsurance: sourceBooking.insuranceCost > 0,
            } : undefined}
          />
        );
      }
    } else if (currentView === "profile" && selectedProviderId) {
      const provider = providersWithDistance.find(
        (p) => p.id === selectedProviderId
      );
      if (provider) {
        mainContent = (
          <ProfileDetail
            provider={provider}
            onBack={handleBackToList}
            onContact={handleContactProvider}
            onBookNow={handleBookNow}
          />
        );
      }
    } else if (currentView === "inbox") {
      mainContent = <Inbox chats={chats} onViewChat={handleViewChat} />;
    } else if (currentView === "chat" && currentChatId) {
      const chat = chats.find((c) => c.id === currentChatId);
      if (chat) {
        mainContent = (
          <Chat
            chat={chat}
            onBack={handleBackFromChat}
            onSendMessage={handleSendMessage}
          />
        );
      }
    } else if (currentView === "landing") {
      mainContent = (
        <LandingPage
          onCategorySelect={handleCategorySelect}
          onShowAll={handleShowAllProviders}
          onNavigateMap={handleNavigateMap}
          onSearch={handleSearch}
          onNavigateHome={handleNavigateHome}
        />
      );
    } else if (currentView === "myProfile") {
      if (!isAuthenticated) {
        mainContent = <ProfileLandingPage 
          onStart={() => {
            setView("roleSelection");
          }}
          onLogin={() => {
            setPreviousViewBeforeAuth(view);
            setPendingAction(null);
            setAuthAttempts(0);
            setAuthMode('login');
            setPreselectedRole(undefined);
            setView("auth");
          }}
          onBack={handleNavigateHome}
        />;
      } else if (!clientProfile && !providerProfile) {
        // Usuario autenticado pero SIN ningún perfil creado
        console.log('⚠️ Usuario autenticado sin perfil. Mostrando RoleSelection');
        mainContent = <RoleSelection 
          onSelectProvider={() => {
            // Usuario ya autenticado, ir directamente a crear perfil profesional
            setActiveRole('provider');
            setView('profesionalRegistration');
          }}
          onSelectSeeker={() => {
            // Usuario ya autenticado, ir directamente a crear perfil familiar
            setActiveRole('client');
            setView('familiarRegistration');
          }}
          onBack={handleNavigateHome}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />;
      } else if (activeRole === 'provider' && providerProfile) {
        console.log('🔵 Mostrando perfil PROFESIONAL. activeRole:', activeRole, 'providerProfile:', providerProfile);
        // Provider Profile
        mainContent = <ProfesionalProfilePage 
          profile={providerProfile}
          onBack={handleNavigateHome}
          onUpdateProfile={handleUpdateProviderProfile}
          onNavigateSecurity={() => setView("securitySettings")}
          onNavigateNotifications={() => setView("notifications")}
          onNavigateLegal={() => setView("legalInfo")}
          onNavigateSupport={() => setView("support")}
          onLogout={async () => {
            try {
              await authService.logout();
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
            }
            setIsAuthenticated(false);
            setClientProfile(null);
            setProviderProfile(null);
            setView("landing");
          }}
          onSwitchToClient={
            async () => {
              try {
                const user = tokenStorage.getUser();
                if (!user || !user.id) {
                  console.error('❌ No hay usuario autenticado');
                  return;
                }

                console.log('🔄 Cambiando a perfil FAMILIAR...');
                
                // 1. Llamar al backend para cambiar el rol activo
                const result = await authService.switchActiveRole(user.id, 'client');
                console.log('✅ Respuesta del backend:', result);

                // 2. Actualizar el rol activo en el estado
                setActiveRole('client');

                // 3. Si existe el perfil en la BD, cargarlo
                if (result.profile) {
                  console.log('✅ Perfil familiar encontrado en BD:', result.profile);
                  
                  // Mapear el perfil del backend al formato de la UI
                  const mappedProfile: ClientProfile = {
                    id: result.profile.id,
                    firstName: result.profile.user?.firstName || user.firstName || '',
                    lastName: result.profile.user?.lastName || user.lastName || '',
                    email: result.profile.user?.email || user.email,
                    phone: result.profile.user?.phone || '',
                    photoUrl: result.profile.user?.photoUrl || '',
                    location: result.profile.user?.location || '',
                    coordinates: result.profile.user?.latitude && result.profile.user?.longitude 
                      ? { latitude: parseFloat(result.profile.user.latitude), longitude: parseFloat(result.profile.user.longitude) }
                      : undefined,
                    languages: result.profile.user?.languages || [],
                    preferences: result.profile.preferences || [],
                  };
                  
                  setClientProfile(mappedProfile);
                } else {
                  console.log('⚠️ No existe perfil familiar en BD, navegando a creación...');
                  // Si no existe el perfil, redirigir a la creación
                  setView('familiarRegistration');
                }
              } catch (error) {
                console.error('❌ Error al cambiar a perfil familiar:', error);
                // En caso de error, mantener perfil temporal si existe providerProfile
                if (!clientProfile && providerProfile) {
                  const tempClientProfile: ClientProfile = {
                    firstName: providerProfile.firstName,
                    lastName: providerProfile.lastName,
                    email: providerProfile.email,
                    phone: providerProfile.phone,
                    photoUrl: providerProfile.photoUrl,
                    location: providerProfile.location,
                    languages: providerProfile.languages,
                    preferences: []
                  };
                  setClientProfile(tempClientProfile);
                }
                setActiveRole('client');
              }
            }
          }
        />;
      } else if (activeRole === 'client' && clientProfile) {
        console.log('🟡 Mostrando perfil FAMILIAR. activeRole:', activeRole, 'clientProfile:', clientProfile);
        // Client Profile
        mainContent = <FamiliarProfilePage 
          clientProfile={clientProfile}
          onNavigateFavorites={handleNavigateFavorites}
          onNavigateSupport={() => setView("support")}
          onNavigateSecurity={() => setView("securitySettings")}
          onNavigateNotifications={() => setView("notifications")}
          onNavigateLegal={() => setView("legalInfo")}
          onUpdateProfile={handleUpdateClientProfile}
          onSwitchToProvider={async () => {
            try {
              const user = tokenStorage.getUser();
              if (!user || !user.id) {
                console.error('❌ No hay usuario autenticado');
                return;
              }

              console.log('🔄 Cambiando a perfil PROFESIONAL...');
              
              // 1. Llamar al backend para cambiar el rol activo
              const result = await authService.switchActiveRole(user.id, 'provider');
              console.log('✅ Respuesta del backend:', result);

              // 2. Actualizar el rol activo en el estado
              setActiveRole('provider');

              // 3. Si existe el perfil en la BD, cargarlo
              if (result.profile) {
                console.log('✅ Perfil profesional encontrado en BD:', result.profile);
                
                // Los servicios ya vienen en result.profile.services del backend
                let servicesMap = {};
                
                if (result.profile.services && result.profile.services.length > 0) {
                  console.log('📦 Servicios incluidos en el perfil:', result.profile.services.length);
                  
                  // Transformar array de ServiceConfigs a objeto por categoría
                  servicesMap = result.profile.services.reduce((acc: any, service: any) => {
                    // Mapear variaciones del backend al formato del frontend
                    const variations = service.variations && Array.isArray(service.variations)
                      ? service.variations.map((v: any) => ({
                          id: v.id,
                          name: v.name,
                          price: parseFloat(v.price) || 0,
                          unit: v.unit,
                          enabled: v.enabled,
                          description: v.description || '',
                          isCustom: v.isCustom || false,
                          displayOrder: v.displayOrder || 0,
                        }))
                      : [];
                    
                    // Mapear certificados del backend al formato del frontend
                    const certificates = service.certificates && Array.isArray(service.certificates)
                      ? service.certificates.map((cert: any) => ({
                          id: cert.id,
                          name: cert.name,
                          contactInfo: cert.contactInfo || '',
                          description: cert.description || '',
                          type: cert.certificateType || 'other',
                          fileName: cert.fileName,
                          fileUrl: cert.fileUrl,
                          status: cert.verificationStatus || 'pending',
                          dateAdded: cert.createdAt,
                        }))
                      : [];
                    
                    acc[service.careCategory] = {
                      id: service.id,
                      completed: service.completed || false,
                      tasks: service.tasks || [],
                      availability: service.availability || [],
                      rates: {
                        hourly: parseFloat(service.hourlyRate) || 0,
                        shift: service.shiftRate ? parseFloat(service.shiftRate) : undefined,
                        urgentSurcharge: service.urgentSurcharge ? parseFloat(service.urgentSurcharge) : undefined,
                      },
                      description: service.description || '',
                      variations: variations,
                      experience: service.experience || '',
                      certificates: certificates,
                    };
                    return acc;
                  }, {});
                  
                  console.log('📦 Servicios transformados con variaciones y certificados:', servicesMap);
                } else {
                  console.log('⚠️ No hay servicios guardados para este perfil');
                }

                // Mapear el perfil del backend al formato de la UI
                const mappedProfile: ProviderProfile = {
                  id: result.profile.id,
                  firstName: result.profile.user?.firstName || user.firstName || '',
                  lastName: result.profile.user?.lastName || user.lastName || '',
                  email: result.profile.user?.email || user.email,
                  phone: result.profile.user?.phone || '',
                  photoUrl: result.profile.user?.photoUrl || '',
                  location: result.profile.user?.location || '',
                  coordinates: result.profile.user?.latitude && result.profile.user?.longitude 
                    ? { latitude: parseFloat(result.profile.user.latitude), longitude: parseFloat(result.profile.user.longitude) }
                    : undefined,
                  languages: result.profile.user?.languages || [],
                  availability: result.profile.availability || [],
                  services: Object.keys(servicesMap).length > 0 ? servicesMap : {
                    [CareCategory.ELDERLY]: {
                      completed: false,
                      tasks: [],
                      rates: { hourly: 0 },
                      variations: [],
                      experience: '',
                      certificates: []
                    },
                    [CareCategory.CHILDREN]: {
                      completed: false,
                      tasks: [],
                      rates: { hourly: 0 },
                      variations: [],
                      experience: '',
                      certificates: []
                    },
                    [CareCategory.PETS]: {
                      completed: false,
                      tasks: [],
                      rates: { hourly: 0 },
                      variations: [],
                      experience: '',
                      certificates: []
                    },
                    [CareCategory.HOUSEKEEPING]: {
                      completed: false,
                      tasks: [],
                      rates: { hourly: 0 },
                      variations: [],
                      experience: '',
                      certificates: []
                    }
                  }
                };
                
                setProviderProfile(mappedProfile);
              } else {
                console.log('⚠️ No existe perfil profesional en BD, navegando a creación...');
                // Si no existe el perfil, redirigir a la creación
                setView('profesionalRegistration');
              }
            } catch (error) {
              console.error('❌ Error al cambiar a perfil profesional:', error);
              // En caso de error, mantener perfil temporal si existe clientProfile
              if (!providerProfile && clientProfile) {
                const tempProviderProfile: ProviderProfile = {
                  firstName: clientProfile.firstName,
                  lastName: clientProfile.lastName,
                  email: clientProfile.email,
                  phone: clientProfile.phone,
                  photoUrl: clientProfile.photoUrl,
                  location: clientProfile.location,
                  languages: clientProfile.languages,
                  availability: [],
                  services: {
                    [CareCategory.ELDERLY]: {
                      completed: false,
                      tasks: [],
                      rates: { hourly: 0 },
                      variations: [],
                      experience: '',
                      certificates: []
                    },
                    [CareCategory.CHILDREN]: {
                      completed: false,
                      tasks: [],
                      rates: { hourly: 0 },
                      variations: [],
                      experience: '',
                      certificates: []
                    },
                    [CareCategory.PETS]: {
                      completed: false,
                      tasks: [],
                      rates: { hourly: 0 },
                      variations: [],
                      experience: '',
                      certificates: []
                    },
                    [CareCategory.HOUSEKEEPING]: {
                      completed: false,
                      tasks: [],
                      rates: { hourly: 0 },
                      variations: [],
                      experience: '',
                      certificates: []
                    }
                  }
                };
                setProviderProfile(tempProviderProfile);
              }
              setActiveRole('provider');
            }
          }}
          onBack={handleNavigateHome}
          onLogout={async () => {
            try {
              await authService.logout();
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
            }
            setIsAuthenticated(false);
            setClientProfile(null);
            setProviderProfile(null);
            setView("landing");
          }}
        />;
      } else {
        // Usuario autenticado pero sin el perfil correspondiente al activeRole
        console.log('⚠️ Usuario autenticado pero sin perfil para activeRole:', activeRole);
        console.log('clientProfile:', clientProfile, 'providerProfile:', providerProfile);
        mainContent = <RoleSelection 
          onSelectProvider={() => {
            // Usuario ya autenticado, ir directamente a crear perfil profesional
            setActiveRole('provider');
            setView('profesionalRegistration');
          }}
          onSelectSeeker={() => {
            // Usuario ya autenticado, ir directamente a crear perfil familiar
            setActiveRole('client');
            setView('familiarRegistration');
          }}
          onBack={handleNavigateHome}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />;
      }
    } else if (currentView === "roleSelection") {
      mainContent = <RoleSelection 
        onSelectProvider={() => {
          // Verificar si el usuario ya está autenticado
          if (isAuthenticated) {
            // Usuario ya autenticado, ir directamente a crear perfil profesional
            setActiveRole('provider');
            setView('profesionalRegistration');
          } else {
            // Usuario NO autenticado, ir a registro
            setPreviousViewBeforeAuth(view);
            setPendingAction(null);
            setAuthAttempts(0);
            setAuthMode('signup');
            setPreselectedRole('provider');
            setView("auth");
          }
        }}
        onSelectSeeker={() => {
          // Verificar si el usuario ya está autenticado
          if (isAuthenticated) {
            // Usuario ya autenticado, ir directamente a crear perfil familiar
            setActiveRole('client');
            setView('familiarRegistration');
          } else {
            // Usuario NO autenticado, ir a registro
            setPreviousViewBeforeAuth(view);
            setPendingAction(null);
            setAuthAttempts(0);
            setAuthMode('signup');
            setPreselectedRole('client');
            setView("auth");
          }
        }}
        onBack={() => setView("myProfile")}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />;
    } else if (currentView === "familiarRegistration") {
      mainContent = <FamiliarRegistration 
        initialData={{
          firstName: userFirstName,
          lastName: userLastName,
          email: userEmail,
          phone: userPhone,
          location: clientProfile?.location || '',
          languages: clientProfile?.languages || [],
          photoUrl: clientProfile?.photoUrl || '',
          preferences: clientProfile?.preferences || [],
        }}
        onComplete={async (profileData) => {
          try {
            // Obtener el userId del usuario autenticado
            const user = tokenStorage.getUser();
            if (!user || !user.id) {
              throw new Error('No se pudo obtener el ID del usuario');
            }

            // Preparar datos del usuario para actualizar
            const userData = {
              firstName: profileData.firstName,
              lastName: profileData.lastName,
              email: profileData.email,
            };

            // Preparar datos para la API
            const createClientDto = {
              userId: user.id,
              phone: profileData.phone,
              photoUrl: profileData.photoUrl,
              location: profileData.location,
              latitude: profileData.coordinates?.latitude,
              longitude: profileData.coordinates?.longitude,
              languages: profileData.languages,
              preferences: profileData.preferences,
              profileStatus: 'published', // Perfil publicado al completar el registro
            };

            // Guardar el perfil en la base de datos (también actualiza datos del usuario)
            const savedProfile = await clientProfileService.create(createClientDto, userData);
            
            // Actualizar el estado local con el perfil guardado (incluye el id)
            setClientProfile({ ...profileData, id: savedProfile.id });
            setActiveRole('client');
            
            // Show success alert
            setAlertModal({ 
              isOpen: true, 
              message: '¡Tu perfil familiar se ha creado exitosamente! Ya puedes buscar cuidadores.', 
              title: 'Perfil publicado'
            });
            
            // Navigate to myProfile view after a short delay
            setTimeout(() => {
              setView("myProfile");
            }, 2000);
          } catch (error: any) {
            console.error('Error al guardar perfil de cliente:', error);
            setAlertModal({ 
              isOpen: true, 
              message: error.message || 'Error al guardar el perfil. Por favor, intenta de nuevo.', 
              title: 'Error' 
            });
          }
        }}
        onBack={handleCancelFamiliarRegistration}
      />;
    } else if (currentView === "profesionalRegistration") {
      mainContent = <ProfesionalRegistration 
        initialData={{
          firstName: userFirstName,
          lastName: userLastName,
          email: userEmail,
          phone: userPhone,
          location: clientProfile?.location || '',
          languages: clientProfile?.languages || [],
        }}
        onComplete={handleProviderRegistrationComplete}
        onCancel={handleCancelProfesionalRegistration}
        currentView={view}
        onNavigateHome={handleNavigateHome}
        onNavigateFavorites={handleNavigateFavorites}
        onNavigateOffer={handleNavigateOffer}
        onNavigateInbox={handleNavigateInbox}
        onNavigateProfile={handleNavigateMyProfile}
        onNavigateBookings={handleNavigateBookings}
        unreadCount={unreadCount}
        isAuthenticated={isAuthenticated}
      />;
    } else if (currentView === "bookings") {
      mainContent = <BookingsList onBack={handleNavigateHome} onNewBooking={handleShowAllProviders} onEditBooking={handleEditBooking} onCloneBooking={handleCloneBooking} userRole={activeRole} />;
    } else if (currentView === "securitySettings") {
      mainContent = <SecuritySettingsPage 
        onBack={() => setView("myProfile")} 
        onDeleteAccount={() => {
          setAlertModal({
            isOpen: true,
            title: 'Eliminar Cuenta',
            message: '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.'
          });
        }}
      />;
    } else if (currentView === "notifications") {
      mainContent = <NotificationsPage onBack={() => setView("myProfile")} />;
    } else if (currentView === "supportChat") {
      mainContent = <SupportChatPage onBack={() => setView("myProfile")} />;
    } else if (currentView === "support") {
      mainContent = <SupportPage 
        onBack={() => setView("myProfile")} 
        onNavigateChat={() => setView("supportChat")} 
        onNavigateEmail={() => setView("supportEmail")} 
      />;
    } else if (currentView === "supportEmail") {
      mainContent = <SupportEmailPage onBack={() => setView("support")} />;
    } else if (currentView === "legalInfo") {
      mainContent = <LegalInfoPage 
        onBack={() => setView("myProfile")} 
        documents={legalDocuments} 
        onNavigateLegalDocument={(docId) => {
          setSelectedLegalDocId(docId);
          setView("legalDocument");
        }} 
      />;
    } else if (currentView === "legalDocument") {
      const doc = legalDocuments.find(d => d.id === selectedLegalDocId);
      mainContent = doc ? (
        <LegalDocumentPage 
          title={doc.title} 
          content={doc.content} 
          onBack={() => setView("legalInfo")} 
        />
      ) : null;
    } else {
      // Providers view
      mainContent = (
        <ProvidersList
          providers={providersWithDistance}
          view="providers"
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          favorites={favorites}
          isLoading={isLoading}
          locationError={locationError}
          userLocation={userLocation}
          onSearchQueryChange={setSearchQuery}
          onSelectCategory={handleShowAll}
          onToggleFavorite={handleToggleFavorite}
          onViewProfile={handleViewProfile}
          onNavigateHome={handleNavigateHome}
          initialShowOnlyFavorites={showFavoritesFromProfile}
        />
      );
    }

    // Render main content with auth overlay if needed
    return (
      <>
        {mainContent}
        {view === "auth" && (
          <AuthPage
            initialMode={authMode}
            preselectedRole={preselectedRole}
            onLoginSuccess={handleLoginSuccess}
            onSignupSuccess={handleSignupSuccess}
            onBack={handleAuthBack}
            onMaxAttemptsReached={handleAuthMaxAttempts}
            authAttempts={authAttempts}
            onAttemptIncrement={() => setAuthAttempts(prev => prev + 1)}
            pendingActionMessage={
              pendingAction === 'booking' 
                ? "Inicia sesión para realizar la reserva" 
                : pendingAction === 'bookings'
                  ? "Inicia sesión para ver tus reservas"
                  : pendingAction === 'inbox'
                    ? "Inicia sesión para ver tus mensajes"
                    : pendingAction === 'chat'
                      ? "Inicia sesión para chatear con el cuidador"
                      : "Inicia sesión para guardar favoritos"
            }
          />
        )}
      </>
    );
  };

  const showBottomNav =
    view !== "offer" &&
    view !== "auth" &&
    !isLocationLoading;

  // Obtener la photoUrl del perfil activo
  const getUserPhotoUrl = (): string | null => {
    if (!isAuthenticated) return null;
    
    const profile = activeRole === 'provider' ? providerProfile : clientProfile;
    if (!profile) return null;
    
    // Si tiene photoUrl, retornarla; si no, usar el placeholder por defecto
    return profile.photoUrl || defaultUserAvatar;
  };

  // For map view, render without wrapper to allow full screen
  if (view === "map") {
    return (
      <>  
        {renderContent()}
        <BottomNav
          currentView={view}
          onNavigateHome={handleNavigateHome}
          onNavigateFavorites={handleNavigateFavorites}
          onNavigateOffer={handleNavigateOffer}
          onNavigateInbox={handleNavigateInbox}
          onNavigateProfile={handleNavigateMyProfile}
          onNavigateBookings={handleNavigateBookings}
          unreadCount={unreadCount}
          isAuthenticated={isAuthenticated}
          activeRole={activeRole}
          userPhotoUrl={getUserPhotoUrl()}
        />
        <CookieConsent />
        <AlertModal 
          isOpen={alertModal.isOpen}
          onClose={() => setAlertModal({ isOpen: false, message: '' })}
          message={alertModal.message}
          title={alertModal.title}
        />
      </>
    );
  }

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen">
      {renderContent()}
      {showBottomNav && (
        <BottomNav
          currentView={view}
          onNavigateHome={handleNavigateHome}
          onNavigateOffer={handleNavigateOffer}
          onNavigateInbox={handleNavigateInbox}
          onNavigateProfile={handleNavigateMyProfile}
          onNavigateBookings={handleNavigateBookings}
          unreadCount={unreadCount}
          isAuthenticated={isAuthenticated}
          activeRole={activeRole}
          userPhotoUrl={getUserPhotoUrl()}
        />
      )}
      <CookieConsent />
      <AlertModal 
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, message: '' })}
        message={alertModal.message}
        title={alertModal.title}
      />
    </div>
  );
};

export default App;
