/**
 * Tipos comunes y enums globales
 */

export enum CareCategory {
  ELDERLY = 'Elderly Care',
  CHILDREN = 'Child Care',
  PETS = 'Pet Care',
  HOUSEKEEPING = 'Home Cleaning',
}

export type ProviderStatus = 'available' | 'busy' | 'offline';
export type ProfileStatus = 'draft' | 'published' | 'suspended';
export type CertificateType = 'experience' | 'education' | 'license' | 'other';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
