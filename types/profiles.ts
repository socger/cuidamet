/**
 * Tipos relacionados con perfiles de proveedores y clientes
 */

import { CareCategory, ProviderStatus } from './common';
import {
  ServiceDescription,
  ServiceConfig,
  ServiceRates,
  PetAttributes,
  HousekeepingAttributes,
  Certificate,
} from './services';

export interface ProviderProfile {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photoUrl: string;
  location: string;
  coordinates?: { latitude: number; longitude: number };
  languages: string[];
  availability: string[]; // Aggregated availability for search filtering
  services: Record<CareCategory, ServiceConfig>;
}

export interface Provider {
  id: number;
  name: string;
  photoUrl: string;
  categories: CareCategory[];
  coordinates: { latitude: number; longitude: number };
  distance: number;
  rating: number;
  reviewsCount: number;
  isPremium?: boolean;
  status: ProviderStatus;
  descriptions: ServiceDescription[];
  services: string[];
  hourlyRate: number;
  location: string;
  languages?: string[];
  availability?: string[];
  detailedRates?: Record<CareCategory, ServiceRates>;
  specificTraining?: Partial<Record<CareCategory, string>>;
  medicalSkills?: string[];
  petAttributes?: PetAttributes;
  housekeepingAttributes?: HousekeepingAttributes;
  verifications: string[];
  reviews?: Review[];
  badges?: string[];
  certificates?: Certificate[];
}

export interface ClientProfile {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl: string;
  phone: string;
  location: string;
  coordinates?: { latitude: number; longitude: number };
  languages: string[];
  preferences: CareCategory[];
}

export interface Review {
  id: number;
  authorName: string;
  authorPhotoUrl: string;
  rating: number; // 1 to 5
  comment: string;
  date: string; // e.g., 'Hace 2 semanas'
}
