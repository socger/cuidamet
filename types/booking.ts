/**
 * Tipos relacionados con reservas y permisos
 */

import { UserRole } from './auth';

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

export interface BookingPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDuplicate: boolean;
  canView: boolean;
}

/**
 * Helper function to get booking permissions based on user role
 */
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
