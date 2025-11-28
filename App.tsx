import React, { useState, useEffect } from "react";
import { CareCategory, Provider, ChatConversation, Message, UserRole } from "./types";
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
    | "favorites"
    | "profile"
    | "offer"
    | "inbox"
    | "chat"
    | "myProfile"
    | "map"
    | "auth"
  >("landing");
  const [previousView, setPreviousView] = useState<
    "providers" | "favorites" | "map"
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

  const unreadCount = chats.reduce((count, chat) => {
    return (
      count +
      chat.messages.filter((m) => m.sender === "other" && !m.read).length
    );
  }, 0);

  const handleToggleFavorite = (providerId: number) => {
    if (!isAuthenticated) {
      setPreviousViewBeforeAuth(view);
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
    setView("favorites");
    setSelectedProviderId(null);
    setCurrentChatId(null);
  };

  const handleNavigateInbox = () => {
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
    if (view === "providers" || view === "favorites" || view === "map") {
      setPreviousView(view);
    }
    setSelectedProviderId(providerId);
    setView("profile");
  };

  const handleBackToList = () => {
    setView(previousView);
    setSelectedProviderId(null);
  };

  const handleBackToInbox = () => {
    setView("inbox");
    setCurrentChatId(null);
  };

  const handleViewChat = (chatId: number) => {
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
    const existingChat = chats.find((chat) => chat.provider.id === providerId);
    if (existingChat) {
      handleViewChat(existingChat.id);
    } else {
      const provider = providers.find((p) => p.id === providerId);
      if (provider) {
        const newChat: ChatConversation = {
          id: chats.length + 1,
          provider,
          messages: [],
        };
        setChats((prevChats) => [...prevChats, newChat]);
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
    setView(previousViewBeforeAuth);
  };

  const handleSignupSuccess = (role: UserRole, email: string) => {
    setIsAuthenticated(true);
    setView(previousViewBeforeAuth);
  };

  const handleAuthBack = () => {
    setView(previousViewBeforeAuth);
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
        />
      );
    } else if (currentView === "offer") {
      mainContent = <OfferService onClose={handleNavigateHome} />;
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
            onBack={handleBackToInbox}
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
      mainContent = <ProfilePage onNavigateFavorites={handleNavigateFavorites} />;
    } else {
      // Providers or Favorites view
      mainContent = (
        <ProvidersList
          providers={providersWithDistance}
          view={currentView as "providers" | "favorites"}
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
            pendingActionMessage="Inicia sesión para guardar favoritos"
          />
        )}
      </>
    );
  };

  const showBottomNav =
    view !== "chat" &&
    view !== "offer" &&
    view !== "auth" &&
    view !== "myProfile" &&
    !isLocationLoading;

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen">
      {renderContent()}
      {showBottomNav && (
        <BottomNav
          currentView={view}
          onNavigateHome={handleNavigateHome}
          onNavigateFavorites={handleNavigateFavorites}
          onNavigateOffer={handleNavigateOffer}
          onNavigateInbox={handleNavigateInbox}
          onNavigateProfile={handleNavigateMyProfile}
          unreadCount={unreadCount}
        />
      )}
      <CookieConsent />
    </div>
  );
};

export default App;
