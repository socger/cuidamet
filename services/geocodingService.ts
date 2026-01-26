/**
 * Servicio de Geocodificación
 * 
 * Maneja la conversión de coordenadas a direcciones usando diferentes proveedores.
 * Incluye manejo de errores CORS y fallbacks automáticos.
 */

interface GeocodingResult {
  success: boolean;
  address: string;
  error?: string;
}

/**
 * Obtiene la dirección a partir de coordenadas usando OpenStreetMap Nominatim
 * 
 * NOTA: Nominatim tiene límite de uso (1 request/segundo) y puede bloquear CORS
 * desde localhost. Si falla, devuelve las coordenadas como fallback.
 * 
 * @param latitude Latitud de la ubicación
 * @param longitude Longitud de la ubicación
 * @returns Objeto con success, address y error (opcional)
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<GeocodingResult> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'es-ES,es;q=0.9',
          'User-Agent': 'CuidametApp/1.0', // Nominatim requiere User-Agent
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    const address = data.address || {};
    const locationParts = [
      address.road || address.pedestrian,
      address.neighbourhood || address.suburb,
      address.city || address.town || address.village,
    ].filter(Boolean);

    if (locationParts.length > 0) {
      return {
        success: true,
        address: locationParts.join(', '),
      };
    } else {
      // Si no hay partes de dirección, usar coordenadas
      return {
        success: true,
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      };
    }
  } catch (error: any) {
    console.warn('Error en geocodificación:', error.message);
    
    // Fallback: devolver coordenadas
    return {
      success: false,
      address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      error: error.message,
    };
  }
};

/**
 * Obtiene la ubicación actual del usuario usando geolocalización del navegador
 * y convierte las coordenadas a una dirección legible
 * 
 * @returns Promise con el resultado de la geocodificación
 */
export const getCurrentLocation = (): Promise<{
  coordinates: { latitude: number; longitude: number };
  address: string;
  error?: string;
}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('La geolocalización no está soportada en este navegador'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Intentar obtener la dirección
        const geocodeResult = await reverseGeocode(latitude, longitude);
        
        resolve({
          coordinates: { latitude, longitude },
          address: geocodeResult.address,
          error: geocodeResult.error,
        });
      },
      (error) => {
        reject(new Error(error.message || 'No se pudo obtener la ubicación'));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 segundos
        maximumAge: 0,
      }
    );
  });
};
