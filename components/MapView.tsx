import React, { useEffect, useRef, useState, useCallback } from "react";
import { Provider, CareCategory, ProviderStatus } from "../types";

// Icons
import ChevronLeftIcon from "./icons/ChevronLeftIcon";
import GpsFixedIcon from "./icons/GpsFixedIcon";
import QueueListIcon from "./icons/QueueListIcon";
import StarIcon from "./icons/StarIcon";
import SearchIcon from "./icons/SearchIcon";
import DirectionsIcon from "./icons/DirectionsIcon";
import ElderlyIcon from "./icons/ElderlyIcon";
import ChildIcon from "./icons/ChildIcon";
import PetIcon from "./icons/PetIcon";
import InformationCircleIcon from "./icons/InformationCircleIcon";
import MapPinIcon from "./icons/MapPinIcon";
import BellIcon from "./icons/BellIcon";
import CleaningIcon from "./icons/CleaningIcon";

// This is a global from the script tag in index.html
declare var L: any;

interface MapViewProps {
  providers: Provider[];
  userLocation: { latitude: number; longitude: number } | null;
  onViewProfile: (providerId: number) => void;
  onBack: () => void;
  onLocationUpdate: (
    location: { latitude: number; longitude: number } | null
  ) => void;
  onLocationLoading: (isLoading: boolean) => void;
  onLocationError: (error: string | null) => void;
  currentUserPhotoUrl?: string;
}

// Colors for the Provider Status (Small dot)
const statusColors: Record<ProviderStatus, string> = {
  available: "#22c55e", // green-500
  busy: "#ef4444", // red-500
  offline: "#94a3b8", // slate-400
};

// Colors for the Service Category (Main Marker)
const categoryColors: Record<CareCategory, string> = {
  [CareCategory.PETS]: "#f97316", // Orange (Mascotas)
  [CareCategory.HOUSEKEEPING]: "#3b82f6", // Blue (Limpieza)
  [CareCategory.ELDERLY]: "#22c55e", // Green (Mayores)
  [CareCategory.CHILDREN]: "#64748b", // Gray (Niños)
};

const createProviderIcon = (provider: Provider, isSelected: boolean) => {
  // 1. Determine Colors
  const primaryCategory = provider.categories[0];
  const mainColor = categoryColors[primaryCategory] || "#64748b";
  const statusColor = statusColors[provider.status] || "#94a3b8";

  // 2. Handle Multi-Service Gradient Border
  let borderStyle = `border: 3px solid ${mainColor};`; // Default single color

  if (provider.categories.length > 1) {
    // Create a conic gradient string based on all provider categories
    const colors = provider.categories.map(
      (cat) => categoryColors[cat] || "#64748b"
    );

    // We create segments for the conic gradient
    const segmentSize = 100 / colors.length;
    const gradientParts = colors
      .map((color, index) => {
        const start = index * segmentSize;
        const end = (index + 1) * segmentSize;
        return `${color} ${start}% ${end}%`;
      })
      .join(", ");

    // CSS trick: linear-gradient for the white background inside, conic-gradient for the border
    borderStyle = `
            background: linear-gradient(white, white) padding-box,
                        conic-gradient(from 0deg, ${gradientParts}) border-box;
            border: 3px solid transparent;
        `;
  }

  // 3. Handle Badges/States
  const isDistinguished =
    provider.isPremium ||
    provider.badges?.some(
      (b) => b === "Mejor Valorado" || b === "Respuesta Rápida"
    );
  const distinguishedClass = isDistinguished ? "distinguished-marker" : "";
  const selectedClass = isSelected ? "selected" : "";
  const badgeHtml =
    provider.rating >= 4.8
      ? `<div style="position:absolute; top:-5px; right:-5px; background:#f59e0b; color:white; border-radius:50%; width:20px; height:20px; font-size:10px; display:flex; align-items:center; justify-content:center; border:2px solid white; font-weight:bold; z-index:10;">★</div>`
      : "";

  return L.divIcon({
    html: `
            <div class="custom-marker-pin ${distinguishedClass} ${selectedClass}">
                <div class="pin-body" style="${borderStyle}">
                    <img src="${provider.photoUrl}" alt="${provider.name}" />
                    <div class="status-dot" style="background-color: ${statusColor} !important;"></div>
                </div>
                <div class="pin-pointer" style="border-top-color: ${mainColor};"></div>
                ${badgeHtml}
            </div>
        `,
    className: "",
    iconSize: [44, 56],
    iconAnchor: [22, 56],
    tooltipAnchor: [0, -60],
  });
};

const MapView: React.FC<MapViewProps> = ({
  providers,
  userLocation,
  onViewProfile,
  onBack,
  onLocationUpdate,
  onLocationLoading,
  onLocationError,
  currentUserPhotoUrl,
}) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [providerId: string]: any }>({});
  const userLocationMarkerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const firstLocationUpdate = useRef(true);

  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<
    CareCategory | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Bottom Sheet State
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);

  // Notifications
  const [notification, setNotification] = useState<{
    text: string;
    visible: boolean;
  }>({ text: "", visible: false });

  // Default placeholder if no user photo is provided
  const displayPhotoUrl =
    currentUserPhotoUrl ||
    "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=200";

  // Auto-refresh simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly simulate a new provider appearance or status change every 30s
      if (Math.random() > 0.8) {
        setNotification({
          text: "¡Nuevo cuidador disponible en tu zona!",
          visible: true,
        });
        setTimeout(
          () => setNotification((prev) => ({ ...prev, visible: false })),
          4000
        );
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRequestLocation = () => {
    onLocationLoading(true);
    onLocationError(null);

    if (!navigator.geolocation) {
      onLocationError(
        "La geolocalización no es compatible. Usando ubicación por defecto en el mapa."
      );
      onLocationUpdate(null);
      onLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationUpdate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        onLocationLoading(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMsg =
          "No se pudo obtener tu ubicación. Mostrando ubicación por defecto en el mapa.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg =
            "Has denegado el permiso de ubicación. Mostrando ubicación por defecto en el mapa.";
        }
        onLocationError(errorMsg);
        onLocationUpdate(null);
        onLocationLoading(false);
      }
    );
  };

  useEffect(() => {
    // Check if container exists and Leaflet is loaded
    if (!mapContainerRef.current || typeof L === "undefined") {
      return;
    }

    // Check if map is already initialized to prevent double initialization
    if (mapRef.current || isMapInitialized) {
      return;
    }

    try {
      const mapCenter: [number, number] = [40.4168, -3.7038];

      // Initialize map with zoomControl false to avoid conflict with our custom UI
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView(mapCenter, 13);

      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      // Add attribution manually at bottom right if needed, or leave minimal
      L.control.attribution({ prefix: false }).addTo(map);

      setIsMapInitialized(true);
      handleRequestLocation();
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    // Cleanup function to remove map when component unmounts
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
          mapRef.current = null;
          setIsMapInitialized(false);
        } catch (error) {
          console.error("Error cleaning up map:", error);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!isMapInitialized || !mapRef.current) return;

    if (userLocation) {
      const userIcon = L.divIcon({
        html: `<div class="user-location-marker"><div class="user-location-dot"></div></div>`,
        className: "",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.setLatLng([
          userLocation.latitude,
          userLocation.longitude,
        ]);
      } else {
        userLocationMarkerRef.current = L.marker(
          [userLocation.latitude, userLocation.longitude],
          { icon: userIcon, zIndexOffset: -100 }
        ).addTo(mapRef.current);
      }

      if (firstLocationUpdate.current) {
        mapRef.current.flyTo(
          [userLocation.latitude, userLocation.longitude],
          15,
          { duration: 1 }
        );
        firstLocationUpdate.current = false;
      }
    }
  }, [isMapInitialized, userLocation]);

  const handleRecenter = () => {
    handleRequestLocation();
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo(
        [userLocation.latitude, userLocation.longitude],
        16,
        { duration: 1 }
      );
    }
  };

  const handleMarkerClick = useCallback((provider: Provider) => {
    setSelectedProvider(provider);
    setIsSheetExpanded(false); // Collapse main sheet when a provider is selected
    if (mapRef.current) {
      mapRef.current.flyTo(
        [provider.coordinates.latitude, provider.coordinates.longitude],
        16,
        { duration: 0.5 }
      );
    }
    // Remove route if exists when selecting new provider
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }
  }, []);

  const handleShowRoute = () => {
    if (!userLocation || !selectedProvider || !mapRef.current) return;

    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
    }

    const latlngs = [
      [userLocation.latitude, userLocation.longitude],
      [
        selectedProvider.coordinates.latitude,
        selectedProvider.coordinates.longitude,
      ],
    ];

    // Draw a simple dashed line
    const polyline = L.polyline(latlngs, {
      color: "#2DD4BF",
      weight: 4,
      dashArray: "10, 10",
      opacity: 0.8,
    }).addTo(mapRef.current);
    routeLayerRef.current = polyline;

    mapRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });
  };

  useEffect(() => {
    if (!isMapInitialized || !mapRef.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => {
      if (mapRef.current.hasLayer(marker)) {
        mapRef.current.removeLayer(marker);
      }
    });
    markersRef.current = {};

    // Apply filters
    const filteredProviders = providers.filter((provider) => {
      const categoryMatch =
        selectedCategory === "all" ||
        provider.categories.includes(selectedCategory);
      const searchMatch =
        !searchQuery ||
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.location.toLowerCase().includes(searchQuery.toLowerCase());

      return categoryMatch && searchMatch;
    });

    filteredProviders.forEach((provider) => {
      const isSelected = selectedProvider?.id === provider.id;
      const icon = createProviderIcon(provider, isSelected);
      const marker = L.marker(
        [provider.coordinates.latitude, provider.coordinates.longitude],
        { icon, riseOnHover: true }
      )
        .on("click", () => handleMarkerClick(provider))
        .addTo(mapRef.current);

      markersRef.current[provider.id] = marker;
    });
  }, [
    isMapInitialized,
    providers,
    selectedCategory,
    searchQuery,
    selectedProvider,
    handleMarkerClick,
  ]);

  // Filter buttons configuration with specific colors to match markers
  const filterButtons = [
    {
      id: CareCategory.ELDERLY,
      icon: '/resources/icons/elderly-female-icon.svg',
      label: "Mayores",
      colorClass: "text-green-500",
      // bgActive: "bg-green-500 ring-green-300",
      bgActive: "bg-teal-500 ring-teal-300",
    },
    {
      id: CareCategory.CHILDREN,
      icon: '/resources/icons/baby-girl-icon.svg',
      label: "Niños",
      colorClass: "text-slate-500",
      // bgActive: "bg-slate-500 ring-slate-300",
      bgActive: "bg-teal-500 ring-teal-300",
    },
    {
      id: CareCategory.PETS,
      icon: '/resources/icons/dog-puppy-face-icon.svg',
      label: "Mascotas",
      colorClass: "text-orange-500",
      // bgActive: "bg-orange-500 ring-orange-300",
      bgActive: "bg-teal-500 ring-teal-300",
    },
    {
      id: CareCategory.HOUSEKEEPING,
      icon: '/resources/icons/housekeeping-icon.svg',
      label: "Limpieza",
      colorClass: "text-blue-500",
      // bgActive: "bg-blue-500 ring-blue-300",
      bgActive: "bg-teal-500 ring-teal-300",
    },
    {
      id: "all",
      icon: '/resources/icons/remove-filter-icon.svg',
      label: "Todos",
      colorClass: "text-slate-700",
      // bgActive: "bg-slate-800 ring-slate-300",
      bgActive: "bg-teal-500 ring-teal-300",
    },
  ];

  // Bottom sheet expanded content component. Expanded Content (Visible only when expanded)
  const BottomSheetExpandedContent = () => (
    <div
      className={`space-y-4 transition-opacity duration-500 ${
        isSheetExpanded
          ? "opacity-100"
          : "opacity-0 pointer-events-none h-0"
      }`}
    >
      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
        Novedades y Alertas
      </h4>

      <div className="flex items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
        <div className="bg-red-100 p-2 rounded-full mr-3 flex-shrink-0">
          <BellIcon className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <p className="font-semibold text-slate-800 text-sm">
            Aviso de tráfico en el centro
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Cortes por obras en Gran Vía. Los cuidadores podrían sufrir
            ligeros retrasos.
          </p>
        </div>
      </div>

      <div className="flex items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
        <div className="bg-blue-100 p-2 rounded-full mr-3 flex-shrink-0">
          <MapPinIcon className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <p className="font-semibold text-slate-800 text-sm">
            Nuevo parque para perros inaugurado
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Zona Retiro. Ideal para paseos largos y seguros con
            mascotas.
          </p>
        </div>
      </div>

      <div className="flex items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
        <div className="bg-green-100 p-2 rounded-full mr-3 flex-shrink-0">
          <ChildIcon className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="font-semibold text-slate-800 text-sm">
            Actividades infantiles gratuitas
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Este fin de semana en la Plaza Mayor. Talleres de pintura y
            juegos.
          </p>
        </div>
      </div>
    </div>
  );

  // Horizontal Pills component (Always Visible at top)
  const HorizontalPills = () => (
    <div className="w-full flex space-x-3 overflow-x-auto pb-2 mb-4 hide-scrollbar flex-shrink-0">
      <button className="flex-shrink-0 pl-2 pr-4 py-1.5 bg-white text-slate-700 text-sm font-medium rounded-full border border-slate-200 shadow-sm flex items-center whitespace-nowrap">
        <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mr-2 text-teal-600">
          <ElderlyIcon className="w-4 h-4" />
        </div>
        3 nuevos cuidadores
      </button>
      <button className="flex-shrink-0 pl-2 pr-4 py-1.5 bg-white text-slate-700 text-sm font-medium rounded-full border border-slate-200 shadow-sm flex items-center whitespace-nowrap">
        <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mr-2 text-amber-600">
          <StarIcon className="w-4 h-4" />
        </div>
        Alta demanda hoy
      </button>
    </div>
  );

  // Header Content (Always Visible)
  const HeaderContent = () => (
    <div className="w-full px-4 flex items-center justify-between mb-3 flex-shrink-0">
      <span className="text-lg font-bold text-slate-800">
        Lo último en la zona
      </span>
      <div
        className={`bg-slate-100 p-1 rounded-full transition-transform duration-300 ${
          isSheetExpanded ? "rotate-180" : ""
        }`}
      >
        {/* Simple visual indicator that toggles */}
        <InformationCircleIcon className="w-5 h-5 text-slate-500" />
      </div>
    </div>
  );

  // Expandable Bottom "Sheet" Bar (Lo último en la zona)
  const ExpandableBottomSheetBar = () => (
    <div
      onClick={() => setIsSheetExpanded(!isSheetExpanded)}
      className={`absolute left-0 right-0 bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-[900] transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1) flex flex-col pointer-events-auto cursor-pointer ${
        isSheetExpanded ? "bottom-16 h-[40vh] pt-3" : "bottom-16 h-auto pb-8 pt-3"
      }`}
    >
      {/* Handle Bar */}
      <div className="w-12 h-1.5 bg-slate-300 rounded-full mb-3 mx-auto flex-shrink-0"></div>

      {/* Header Content (Always Visible) */}
      <HeaderContent />

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 hide-scrollbar">
        <HorizontalPills />
        <BottomSheetExpandedContent />
      </div>
    </div>
  );

  return (
    <div className="w-screen h-screen overflow-hidden relative bg-slate-200">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Loading indicator */}
      {!isMapInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-[5000]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Cargando mapa...</p>
          </div>
        </div>
      )}

      {/* Top Search Bar (Google Maps Style) */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex gap-3 pointer-events-none">
        <div
          className="bg-white rounded-full shadow-md p-3 flex items-center justify-center text-slate-600 pointer-events-auto cursor-pointer hover:bg-slate-50"
          onClick={onBack}
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </div>
        <div className="flex-1 flex items-center bg-white rounded-full shadow-md px-4 py-2 pointer-events-auto">
          <input
            type="text"
            placeholder="Buscar aquí"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-500 h-full"
          />
          <div className="pl-3 border-l border-slate-200 flex items-center">
            <SearchIcon className="w-5 h-5 text-slate-400" />
            <div className="w-8 h-8 ml-3 rounded-full overflow-hidden border border-slate-200">
              <img
                src={displayPhotoUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Floating Filters (4 Vertical Buttons) */}
      <div className="absolute top-24 right-4 z-[1000] flex flex-col gap-3 pointer-events-auto">
        {filterButtons.map((btn) => {
          const isActive = selectedCategory === btn.id;
          return (
            <button
              key={btn.id.toString()}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCategory(btn.id as CareCategory | "all");
              }}
              className={`w-11 h-11 rounded-full shadow-md flex items-center justify-center transition-all duration-200 ${
                isActive
                  ? `${btn.bgActive} text-white ring-2 scale-110`
                  : `bg-slate-200 hover:bg-slate-300 border border-teal-500`
              }`}
              aria-label={btn.label}
              title={btn.label}
            >
              <img 
                src={btn.icon} 
                alt={btn.label} 
                className={`w-5 h-5 transition-all ${
                  isActive 
                    ? '[filter:brightness(0)_invert(1)]' 
                    : '[filter:brightness(0)]'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Floating Notification Toast */}
      {notification.visible && (
        <div className="absolute top-40 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg z-[1100] text-sm font-medium animate-fade-in flex items-center pointer-events-none">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          {notification.text}
        </div>
      )}

      {/* GPS Control (Anchored above bottom sheet) - Adjust position based on expansion */}
      <div
        className={`absolute right-4 z-[1000] pointer-events-auto transition-all duration-500 ease-out ${
          isSheetExpanded ? "bottom-[42vh]" : "bottom-64"
        }`}
      >
        <button
          onClick={handleRecenter}
          className="bg-white p-3 rounded-full shadow-lg hover:bg-slate-50 text-slate-700 transition-colors"
          aria-label="Centrar en mi ubicación"
        >
          <GpsFixedIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Mini Profile Sheet (Modal) - Replaces Bottom Sheet when provider selected */}
      {selectedProvider && (
        <div className="absolute bottom-16 left-0 right-0 bg-white rounded-t-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-[2000] p-4 pb-8 animate-slide-up-fast pointer-events-auto">
          <div className="flex gap-4">
            <div className="relative">
              <img
                src={selectedProvider.photoUrl}
                alt={selectedProvider.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
              />
              <div
                className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                  selectedProvider.status === "available"
                    ? "bg-green-500"
                    : selectedProvider.status === "busy"
                    ? "bg-red-500"
                    : "bg-slate-400"
                }`}
              ></div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-slate-800">
                  {selectedProvider.name}
                </h3>
                <div className="flex items-center bg-amber-100 px-2 py-0.5 rounded-full">
                  <StarIcon className="w-3 h-3 text-amber-500 mr-1" />
                  <span className="text-xs font-bold text-amber-700">
                    {selectedProvider.rating}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-500 truncate">
                {selectedProvider.services.join(", ")}
              </p>
              <div className="flex items-center mt-1">
                <span className="font-bold text-teal-600 text-lg">
                  {selectedProvider.hourlyRate}€
                </span>
                <span className="text-xs text-slate-400 ml-1">/ hora</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={handleShowRoute}
              className="flex items-center justify-center py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
            >
              <DirectionsIcon className="w-5 h-5 mr-2" />
              Ver Ruta
            </button>
            <button
              onClick={() => onViewProfile(selectedProvider.id)}
              className="py-2.5 px-4 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/30"
            >
              Ver Perfil
            </button>
          </div>
          <button
            onClick={() => {
              setSelectedProvider(null);
              if (routeLayerRef.current) {
                routeLayerRef.current.remove();
                routeLayerRef.current = null;
              }
            }}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Expandable Bottom "Sheet" Bar (Lo último en la zona) */}
      {!selectedProvider && (
        <ExpandableBottomSheetBar />
      )}

      <style>{`
        @keyframes slideUpFast {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up-fast { animation: slideUpFast 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default MapView;
