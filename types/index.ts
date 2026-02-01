/**
 * Punto de entrada principal para todos los tipos de la aplicación
 * Re-exporta todos los tipos desde sus módulos específicos
 * 
 * Uso: import { CareCategory, ProviderProfile, Message } from '../types';
 */

// Common types and enums
export * from './common';

// Service-related types
export * from './services';

// Profile types
export * from './profiles';

// Authentication types
export * from './auth';

// Booking types
export * from './booking';

// Chat types
export * from './chat';

// Legal types
export * from './legal';
