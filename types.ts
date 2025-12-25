
// Import React to resolve React.ReactNode namespace
import React from 'react';

export interface Service {
  id: string;
  name: string;
  price: string;
  duration: string;
  category: 'Наращивание' | 'Ламинирование' | 'Коррекция';
  description?: string;
}

export interface Master {
  id: string;
  name: string;
  role: string;
  image: string;
  experience?: string;
  description?: string;
  rating?: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  serviceId?: string;
  masterName?: string;
  status?: 'published' | 'hidden' | 'pending';
}

export interface Feature {
  id: string;
  title: string;
  icon: React.ReactNode;
}

export interface BookingState {
  serviceId: string | null;
  masterId: string | null;
  date: string | null;
  time: string | null;
  userData: {
    name: string;
    phone: string;
    email: string;
    comment: string;
    createAccount: boolean;
  };
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  avatar: string;
  birthday: string;
  loyaltyStamps: number;
  totalVisits: number;
}

export interface PastBooking {
  id: string;
  date: string;
  service: string;
  master: string;
  price: string;
  status: 'completed' | 'cancelled' | 'no-show' | 'confirmed' | 'pending';
  reviewId?: string;
  clientName?: string;
  clientPhone?: string;
}

export interface ScheduleEntry {
  id: string;
  timeStart: string;
  timeEnd: string;
  clientName: string;
  clientPhone: string;
  service: string;
  price: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
}

export interface PortfolioWork {
  id: string;
  imageUrl: string;
  serviceType: string;
  description?: string;
  masterName?: string;
  status?: 'published' | 'hidden';
}

export interface MasterClient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  visits: number;
  totalSpent: string;
  lastVisit: string;
  loyaltyStamps: number;
  notes: string;
  isBlacklisted?: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  promoCode?: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'draft';
}

export interface BlacklistEntry {
  id: string;
  name: string;
  phone: string;
  reason: string;
  addedBy: string;
  date: string;
}