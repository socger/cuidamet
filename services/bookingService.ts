import { BookingDetails } from '../types';

export interface Booking extends BookingDetails {
  id: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  providerName: string; // Denormalized for easier display
  providerPhotoUrl: string; // Denormalized for easier display
}

// Mock initial data
let bookings: Booking[] = [
  {
    id: '1',
    providerId: 1,
    providerName: 'María García',
    providerPhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    startDate: '2023-11-15',
    startTime: '09:00',
    endDate: '2023-11-16',
    endTime: '13:00',
    hours: 4,
    totalCost: 48.00,
    discountAmount: 0,
    insuranceCost: 0,
    status: 'completed',
    createdAt: '2023-11-10T10:00:00Z'
  },
  {
    id: '2',
    providerId: 2,
    providerName: 'Carlos Rodríguez',
    providerPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    startDate: '2023-12-20',
    startTime: '15:00',
    endDate: '2023-12-20',
    endTime: '18:00',
    hours: 3,
    totalCost: 45.00,
    discountAmount: 0,
    insuranceCost: 4.00,
    status: 'confirmed',
    createdAt: '2023-12-01T14:30:00Z'
  }
];

export const bookingService = {
  getBookings: (): Booking[] => {
    return [...bookings].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  },

  addBooking: (details: BookingDetails, providerName: string, providerPhotoUrl: string): Booking => {
    const newBooking: Booking = {
      ...details,
      id: Math.random().toString(36).substr(2, 9),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      providerName,
      providerPhotoUrl
    };
    bookings = [newBooking, ...bookings];
    return newBooking;
  },

  updateBooking: (bookingId: string, details: BookingDetails): Booking | null => {
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) return null;
    
    const updatedBooking: Booking = {
      ...bookings[bookingIndex],
      ...details,
    };
    bookings[bookingIndex] = updatedBooking;
    return updatedBooking;
  },

  getBookingById: (bookingId: string): Booking | null => {
    return bookings.find(b => b.id === bookingId) || null;
  }
};
