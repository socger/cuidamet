export type ServiceCategory = "mayores" | "niños" | "mascotas" | "limpieza";

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Provider extends User {
  category: ServiceCategory;
  description: string;
  pricePerHour: number;
  rating: number;
  reviewsCount: number;
  location: Location;
  gallery: string[];
}

export interface Booking {
  id: string;
  provider: Provider;
  date: string;
  startTime: string;
  durationHours: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  totalPrice: number;
  reviewed?: boolean;
}

export interface Chat {
  id: string;
  user: User;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  dateTimestamp: number;
}

export interface Message {
  id: string;
  text: string;
  senderId: "currentUser" | string;
  timestamp: string;
}

export interface Review {
  id: string;
  bookingId: string;
  reviewer: User;
  rating: number;
  comment: string;
  date: string;
}
