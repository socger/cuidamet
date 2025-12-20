import React, { useState, useEffect } from "react";
import { CareCategory, Provider, ChatConversation, Message, UserRole, BookingDetails } from "./types";
import { MOCK_PROVIDERS } from "./services/mockData";
import { MOCK_CHATS } from "./services/mockChatData";
import BottomNav from "./components/BottomNav";
import LandingPage from "./components/LandingPage";
import ProfileDetail from "./components/ProfileDetail";
import OfferService from "./components/OfferService";
import Inbox from "./components/Inbox";
import Chat from "./components/Chat";
import ProfilePage from "./components/ProfilePage";
import MapView from "./components/MapView";
import CookieConsent from "./components/CookieConsent";
import ProvidersList from "./components/ProvidersList";
import AuthPage from "./components/AuthPage";
import BookingPage from "./components/BookingPage";
import BookingsList from "./components/BookingsList";
import { bookingService } from "./services/bookingService";
import AlertModal from "./components/AlertModal";
import ProfileLandingPage from "./components/ProfileLandingPage";
import RoleSelection from "./components/RoleSelection";

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
  
  // Booking state
  const [bookingProviderId, setBookingProviderId] = useState<number | null>(null);
  
  // Alert Modal state
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; title?: string }>({ isOpen: false, message: '' });
  
  // Favorites filter state (when navigating from ProfilePage)
  const [showFavoritesFromProfile, setShowFavoritesFromProfile] = useState<boolean>(false);

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
      setView("auth");
      return;
    }
    setView("inbox");
    setSelectedProviderId(null);
    setCurrentChatId(null);
  };

  const handleNavigateOffer = () => {
    setView("offer");
    setSelectedProviderId(null);
    setCurrentChatId(null);
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

  const handleLoginSuccess = (role: UserRole) => {
    setIsAuthenticated(true);
    setAuthAttempts(0);
    
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

  const handleSignupSuccess = (role: UserRole, email: string) => {
    setIsAuthenticated(true);
    setAuthAttempts(0);
    
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
  
  const handleBookNow = (providerId: number) => {
    if (!isAuthenticated) {
      setPreviousViewBeforeAuth(view);
      setPendingAction('booking');
      setBookingProviderId(providerId);
      setAuthAttempts(0);
      setView("auth");
      return;
    }
    
    setBookingProviderId(providerId);
    setView('booking');
  };
  
  const handleBookingBack = () => {
    setView('profile');
    setBookingProviderId(null);
  };
  
  const handleBookingProceed = (details: BookingDetails) => {
    // Here you would normally process the payment
    console.log('Booking details:', details);
    
    // Save booking using the service
    const provider = providers.find(p => p.id === details.providerId);
    if (provider) {
      bookingService.addBooking(details, provider.name, provider.photoUrl);
    }
    
    setAlertModal({ isOpen: true, message: `Reserva confirmada para ${details.hours} horas por ${details.totalCost}€`, title: 'Reserva Confirmada' });
    setView('bookings'); // Navigate to bookings list instead of landing
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
      mainContent = <OfferService onClose={handleNavigateHome} />;
    } else if (currentView === "booking" && bookingProviderId) {
      const provider = providersWithDistance.find(
        (p) => p.id === bookingProviderId
      );
      if (provider) {
        mainContent = (
          <BookingPage
            provider={provider}
            onBack={handleBookingBack}
            onProceed={handleBookingProceed}
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
            setView("auth");
          }}
          onBack={handleNavigateHome}
        />;
      } else {
        mainContent = <ProfilePage 
          clientProfile={null}
          onNavigateFavorites={handleNavigateFavorites}
          onNavigateSettings={() => {
            // TODO: Navigate to settings
            setAlertModal({ isOpen: true, title: 'Configuración', message: 'Esta función estará disponible próximamente' });
          }}
          onNavigateSupport={() => {
            // TODO: Navigate to support
            setAlertModal({ isOpen: true, title: 'Ayuda', message: 'Esta función estará disponible próximamente' });
          }}
          onNavigateSupportChat={() => {
            // TODO: Navigate to support chat
            setAlertModal({ isOpen: true, title: 'Chat de soporte', message: 'Esta función estará disponible próximamente' });
          }}
          onSwitchToProvider={() => {
            // TODO: Switch to provider mode
            setAlertModal({ isOpen: true, title: 'Modo proveedor', message: 'Esta función estará disponible próximamente' });
          }}
          onBack={handleNavigateHome}
        />;
      }
    } else if (currentView === "roleSelection") {
      mainContent = <RoleSelection 
        onSelectProvider={() => {
          // TODO: Navigate to provider registration
          setAlertModal({ isOpen: true, title: 'Registro de proveedor', message: 'Esta función estará disponible próximamente' });
        }}
        onSelectSeeker={() => {
          setPreviousViewBeforeAuth(view);
          setPendingAction(null);
          setAuthAttempts(0);
          setView("auth");
        }}
        onBack={() => setView("myProfile")}
      />;
    } else if (currentView === "bookings") {
      mainContent = <BookingsList onBack={handleNavigateHome} onNewBooking={handleShowAllProviders} />;
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
            initialMode="login"
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
