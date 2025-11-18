
import React, { useEffect, useRef, useState } from 'react';
import { Provider, CareCategory } from '../types';
import MapPinIcon from './icons/MapPinIcon';

declare var L: any; // Declare Leaflet global

interface MapViewProps {
  providers: Provider[];
  userLocation: { latitude: number; longitude: number } | null;
  onViewProfile: (providerId: number) => void;
  onBack: () => void;
  onLocationUpdate: (location: { latitude: number; longitude: number } | null) => void;
  onLocationLoading: (isLoading: boolean) => void;
  onLocationError: (error: string | null) => void;
}

const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

const categoryColors: Record<CareCategory, string> = {
  [CareCategory.ELDERLY]: '#3b82f6', // Tailwind blue-500
  [CareCategory.CHILDREN]: '#a855f7', // Tailwind purple-500
  [CareCategory.PETS]: '#f97316', // Tailwind orange-500
};
const defaultColor = '#14b8a6'; // Tailwind teal-500

const createProviderIcon = (provider: Provider) => {
    const primaryCategory = provider.categories[0];
    const color = categoryColors[primaryCategory] || defaultColor;

    return L.divIcon({
        html: `
            <div class="custom-marker-pin">
                <div class="pin-body" style="border-color: ${color};">
                    <img src="${provider.photoUrl}" alt="${provider.name}" />
                </div>
                <div class="pin-pointer" style="border-top-color: ${color};"></div>
            </div>
        `,
        className: '', // Disables default Leaflet styles for this element
        iconSize: [44, 56],
        iconAnchor: [22, 56], // Point of the pin bottom center
        popupAnchor: [0, -56]
    });
};

const MapView: React.FC<MapViewProps> = ({ providers, userLocation, onViewProfile, onBack, onLocationUpdate, onLocationLoading, onLocationError }) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  const [mapState, setMapState] = useState<'requesting' | 'loading' | 'ready'>('requesting');
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  const handleRequestLocation = () => {
    setMapState('loading');
    onLocationLoading(true);
    onLocationError(null);

    if (!navigator.geolocation) {
      onLocationError("La geolocalización no es compatible. Usando ubicación por defecto en el mapa.");
      onLocationUpdate(null);
      onLocationLoading(false);
      setMapState('ready');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationUpdate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        onLocationLoading(false);
        setMapState('ready');
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMsg = "No se pudo obtener tu ubicación. Mostrando ubicación por defecto en el mapa.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Has denegado el permiso de ubicación. Mostrando ubicación por defecto en el mapa.";
        }
        onLocationError(errorMsg);
        onLocationUpdate(null);
        onLocationLoading(false);
        setMapState('ready');
      }
    );
  };
  
  useEffect(() => {
    if (mapState !== 'ready' || typeof L === 'undefined' || !mapContainerRef.current) {
      return;
    }
    
    if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
    }
    
    setIsMapInitialized(false);
    
    const mapCenter: [number, number] = userLocation 
        ? [userLocation.latitude, userLocation.longitude]
        : [40.4168, -3.7038]; // Madrid default

    const map = L.map(mapContainerRef.current).setView(mapCenter, 13);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    if (userLocation) {
        L.circleMarker([userLocation.latitude, userLocation.longitude], {
            radius: 8,
            color: '#ffffff',
            weight: 2,
            fillColor: '#3b82f6', // blue-500
            fillOpacity: 1
        }).addTo(map)
          .bindTooltip("Tu ubicación")
          .openTooltip();
    }

    providers.forEach(provider => {
        const icon = createProviderIcon(provider);
        
        const popupContent = `
            <div class="flex items-center space-x-3 p-1" style="font-family: 'Poppins', sans-serif;">
                <img src="${provider.photoUrl}" alt="${provider.name}" class="w-16 h-16 rounded-lg object-cover" />
                <div class="flex-grow">
                    <h3 class="font-bold text-sm text-slate-800">${provider.name}</h3>
                    <div class="flex items-center mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-amber-500"><path fill-rule="evenodd" d="M10.868 2.884c.321-.772 1.305-.772 1.626 0l1.833 4.431 4.862.707c.85.124 1.19.116.6 1.804l-3.518 3.428.83 4.844c.145.846-.738 1.493-1.49.108l-4.347-2.285-4.348 2.285c-.752.385-1.635-.262-1.49-1.108l.83-4.844L.437 9.824c-.59-.644-.25-1.68.6-1.804l4.862-.707 1.833-4.431z" clip-rule="evenodd" /></svg>
                        <span class="ml-1 text-xs font-semibold text-slate-600">${provider.rating.toFixed(1)}</span>
                    </div>
                    <button id="view-profile-${provider.id}" class="mt-2 w-full text-center bg-teal-500 text-white text-xs font-semibold py-1 px-2 rounded-md hover:bg-teal-600 transition-colors">
                        Ver perfil
                    </button>
                </div>
            </div>
        `;

        const marker = L.marker(
            [provider.coordinates.latitude, provider.coordinates.longitude],
            { icon }
        ).addTo(map);
        
        marker.bindPopup(popupContent, { minWidth: 200 });
        marker.bindTooltip(provider.name);
    });
    
    map.on('popupopen', (e: any) => {
        const popupNode = e.popup.getContent();
        if (typeof popupNode === 'string' && popupNode.includes('id="view-profile-')) {
            const providerIdMatch = popupNode.match(/id="view-profile-(\d+)"/);
            if (providerIdMatch && providerIdMatch[1]) {
                const providerId = parseInt(providerIdMatch[1], 10);
                const btn = e.popup.getElement().querySelector(`#view-profile-${providerId}`);
                if (btn) {
                    btn.addEventListener('click', () => {
                        onViewProfile(providerId);
                    });
                }
            }
        }
    });

    map.whenReady(() => {
      setTimeout(() => {
        if (mapRef.current) {
            mapRef.current.invalidateSize();
            setIsMapInitialized(true);
        }
      }, 100);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapState, providers, userLocation, onViewProfile]);

  if (mapState === 'requesting') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-center p-4">
        <MapPinIcon className="w-20 h-20 text-teal-400 mb-6" />
        <h2 className="text-2xl font-bold text-slate-800">Encuentra cuidadores cerca de ti</h2>
        <p className="text-slate-600 mt-2 max-w-sm">Para mostrarte los cuidadores disponibles en tu zona, Cuidamet necesita acceder a tu ubicación.</p>
        <div className="flex flex-col space-y-4 mt-8 w-full max-w-xs">
            <button 
                onClick={handleRequestLocation} 
                className="bg-teal-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-600 transition-colors"
            >
                Activar ubicación
            </button>
            <button 
                onClick={onBack} 
                className="text-slate-500 font-semibold hover:text-slate-700 transition-colors"
            >
                Volver al inicio
            </button>
        </div>
      </div>
    );
  }

  if (mapState === 'loading') {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <h2 className="text-xl font-semibold text-slate-700 mt-6">Obteniendo tu ubicación</h2>
          <p className="text-slate-500 mt-2">Por favor, concede permiso para continuar.</p>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100">
       <header className="bg-white/90 backdrop-blur-lg sticky top-0 z-40 border-b border-slate-200 flex-shrink-0">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <button onClick={onBack} className="p-2 -ml-2 text-slate-600 hover:text-teal-500">
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-slate-800">Cuidadores en el mapa</h1>
            <div className="w-6"></div> {/* Spacer to center title */}
        </div>
      </header>
      <main className="flex-grow relative">
        <div 
          ref={mapContainerRef} 
          className="absolute inset-0 z-0"
        >
          {/* Leaflet map will be mounted here */}
        </div>
         {!isMapInitialized && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10 pointer-events-none">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
                <p className="ml-3 text-slate-500">Cargando mapa...</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default MapView;