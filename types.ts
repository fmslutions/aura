
export enum AppView {
  INSTITUTIONAL = 'INSTITUTIONAL',
  DASHBOARD = 'DASHBOARD',
  PWA = 'PWA',
  AUTH = 'AUTH',
  AURA_ADMIN = 'AURA_ADMIN'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  SALON_OWNER = 'SALON_OWNER',
  STAFF = 'STAFF',
  CLIENT = 'CLIENT',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
  address: string;
  geolocation?: { lat: number; lng: number };
  languages: string[];
  timezone: string;
  currency: string;
  stripeConnected: boolean;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  avatar_url?: string; // DB column
  specialties: string[];
  services?: string[]; // DB column (jsonb)
}

export interface Booking {
  id: string;
  serviceId?: string; // Optional for compatibility
  service_id?: string; // DB
  staffId?: string;
  staff_id?: string; // DB
  clientId?: string;
  client_id?: string; // DB
  dateTime?: string;
  start_time?: string; // DB
  end_time?: string; // DB
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  customer_name?: string;
  customer_email?: string;
  price?: number; // Virtual field for UI
  service_name?: string; // Virtual
  customer?: string; // Virtual
}

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
