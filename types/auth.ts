/**
 * Tipos relacionados con autenticación y roles de usuario
 */

export type AuthMode = 'login' | 'signup' | 'forgotPassword' | 'verifyEmail';
export type UserRole = 'client' | 'provider';

/**
 * Datos para registro de nuevo usuario
 */
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  profileType: 'provider' | 'client'; // Tipo de perfil: provider (cuidador) o client (familiar)
}

/**
 * Datos para login
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Respuesta de autenticación exitosa
 */
export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
  };
}

/**
 * Respuesta de renovación de token
 */
export interface RefreshResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}

/**
 * Datos para creación inicial de perfil
 */
export interface ProfileCreateData {
  userId: number;
  phoneNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  bio?: string;
}
