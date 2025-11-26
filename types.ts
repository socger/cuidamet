
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
}

export interface ChatConversation {
  id: number;
  provider: Provider;
  messages: Message[];
}

// Auth Types
export type AuthMode = 'login' | 'signup' | 'forgotPassword' | 'verifyEmail';
export type UserRole = 'client' | 'provider';