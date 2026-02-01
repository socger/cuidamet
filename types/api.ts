/**
 * DTOs (Data Transfer Objects) para comunicación con la API
 * Estos tipos representan la estructura de datos esperada por el backend
 */

/**
 * DTO para crear perfil de cliente
 */
export interface ClientProfileCreateDto {
  userId: number;
  phone?: string;
  photoUrl?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  languages?: string[];
  preferences?: string[];
  profileStatus?: string;
  isPremium?: boolean;
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
 */
export interface ProviderProfileCreateDto {
  userId: number;
  phone?: string;
  photoUrl?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  languages?: string[];
  availability?: string[];
  profileStatus?: string;
  isPremium?: boolean;
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
