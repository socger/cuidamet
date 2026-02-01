import React from 'react';

export enum CareCategory {
  ELDERLY = 'Elderly Care',
  CHILDREN = 'Child Care',
  PETS = 'Pet Care',
  HOUSEKEEPING = 'Home Cleaning',
}

export type ProviderStatus = 'available' | 'busy' | 'offline';

export interface Review {
  id: number;
  authorName: string;
  authorPhotoUrl: string;
  rating: number; // 1 to 5
  comment: string;
  date: string; // e.g., 'Hace 2 semanas'
}

export interface ServiceDescription {
  category: CareCategory;
  text: string;
}

export type CertificateType = 'experience' | 'education' | 'license' | 'other';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

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

export type ProfileStatus = 'draft' | 'published' | 'suspended';

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

export interface Message {
  id: number;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
  read: boolean;
  groundingChunks?: { web?: { uri: string; title: string } }[];
}

export interface ChatConversation {
  id: number;
  provider: Provider;
  messages: Message[];
}

export interface LegalDocument {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
}

// Booking Types
export interface BookingDetails {
  providerId: number;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  hours: number;
  totalCost: number;
  discountAmount: number;
  insuranceCost: number;
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

// Auth Types
export type AuthMode = 'login' | 'signup' | 'forgotPassword' | 'verifyEmail';
export type UserRole = 'client' | 'provider';

// Booking Permissions
export interface BookingPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDuplicate: boolean;
  canView: boolean;
}

// Helper function to get booking permissions based on user role
export const getBookingPermissions = (role: UserRole): BookingPermissions => {
  if (role === 'client') {
    return {
      canCreate: true,
      canEdit: true,
      canDuplicate: true,
      canView: true,
    };
  }
  
  // Provider role: can only view, cannot create/edit/duplicate
  return {
    canCreate: false,
    canEdit: false, // Can view but not modify
    canDuplicate: false,
    canView: true,
  };
};