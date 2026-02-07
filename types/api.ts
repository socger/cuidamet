/**
 * DTOs (Data Transfer Objects) para comunicación con la API
 * Estos tipos representan la estructura de datos esperada por el backend
 */

/**
 * DTO para crear perfil de cliente
 * 
 * NOTA: Los campos phone, photoUrl, location, latitude, longitude, languages e isPremium
 * se guardan en la tabla 'users' del backend, no en 'client_profiles'.
 * El servicio profileService.ts se encarga automáticamente de enviarlos al endpoint correcto.
 */
export interface ClientProfileCreateDto {
  userId: number;
  // Campos que se guardan en 'users'
  phone?: string;
  photoUrl?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  languages?: string[];
  isPremium?: boolean;
  // Campos específicos del perfil de cliente
  preferences?: string[];
  profileStatus?: string;
}

/**
 * Respuesta de la API para perfil de cliente
 */
export interface ClientProfileResponse {
  id: number;
  userId: number;
  phoneNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  user?: any;
}

/**
 * DTO para crear perfil de proveedor
 * 
 * NOTA: Los campos phone, photoUrl, location, latitude, longitude, languages e isPremium
 * se guardan en la tabla 'users' del backend, no en 'provider_profiles'.
 * El servicio profileService.ts se encarga automáticamente de enviarlos al endpoint correcto.
 */
export interface ProviderProfileCreateDto {
  userId: number;
  // Campos que se guardan en 'users'
  phone?: string;
  photoUrl?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  languages?: string[];
  isPremium?: boolean;
  // Campos específicos del perfil de proveedor
  availability?: string[];
  profileStatus?: string;
  providerStatus?: string;
  rating?: number;
  reviewsCount?: number;
  completedBookings?: number;
  verifications?: string[];
  badges?: string[];
}

/**
 * Respuesta de la API para perfil de proveedor
 */
export interface ProviderProfileResponse {
  id: number;
  userId: number;
  phoneNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  bio?: string;
  serviceTypeId?: number;
  hourlyRate?: number;
  yearsOfExperience?: number;
  rating?: number;
  totalReviews?: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  user?: any;
}
