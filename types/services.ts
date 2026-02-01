/**
 * Tipos relacionados con servicios, tarifas y certificados
 */

import { CareCategory, CertificateType, VerificationStatus } from './common';

export interface Certificate {
  id: string;
  name: string; // Institution or Reference Name
  contactInfo?: string; // Private (Phone/Email)
  description: string;
  type: CertificateType;
  fileName?: string;
  fileUrl?: string; // In a real app, this would be a secure URL
  status: VerificationStatus;
  dateAdded: string;
}

export interface ServiceRates {
  hourly: number;
  shift?: number; // Price per 8h/day or per service/m2
  urgentSurcharge?: number; // Percentage increase
  extras?: { name: string; price: number }[];
}

export interface PetAttributes {
  acceptedPets: string[];
  workZones: string[];
  maxPets: number;
}

export interface HousekeepingAttributes {
  products: 'provider' | 'client' | 'flexible';
  equipment: boolean;
  waste: boolean;
  eco: boolean;
}

export interface ServiceVariation {
  name: string;
  price: number;
  unit: string; // 'hora', 'noche', 'visita', 'paseo', 'servicio'
  enabled: boolean;
  description: string;
  isCustom?: boolean; // Identifica variaciones creadas por el usuario
}

export interface ServiceConfig {
  completed: boolean;
  tasks: string[];
  rates: ServiceRates;
  variations: ServiceVariation[]; // Nueva estructura detallada de precios
  experience: string; // Years range
  availability?: string[]; // Specific availability for this service (Human readable tags)
  schedule?: { startTime: string; endTime: string }; // Rango de tiempo específico
  specificDates?: string[]; // Fechas específicas en formato ISO
  training?: string; // Specific training text
  description?: string;
  certificates: Certificate[];
  petAttributes?: PetAttributes; // Specific for pets
  housekeepingAttributes?: HousekeepingAttributes; // Specific for housekeeping
  medicalSkills?: string[]; // Specific for elderly/medical care
}

export interface ServiceDescription {
  category: CareCategory;
  text: string;
}
