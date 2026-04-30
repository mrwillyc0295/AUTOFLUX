export type LeadStatus = 'Vendido por Nuestra App' | 'Vendido por Fuera' | 'Lead No Calificado' | 'Apartado/En Pausa' | 'Nuevo';

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number; 
  basePrice?: number;
  mileage: number;
  location: string;
  image: string;
  images?: string[];
  video?: string;
  seller: string;
  sellerId: string;
  sellerPhoto?: string;
  sellerBio?: string;
  sellerWhatsApp?: string;
  status: 'active' | 'reserved' | 'sold';
  condition?: 'Nuevo' | 'Usado';
  createdAt?: any;
  updatedAt?: any;
  views?: number;
  clics?: number;
  interactions?: number;
  transmission?: string;
  fuelType?: string;
  engineLiters?: string;
}

export interface UserProfile {
  uid: string;
  authUid?: string;
  name: string;
  whatsapp: string;
  role: 'marketplace' | 'seller' | 'admin';
  country?: string;
  photo?: string;
  bio?: string;
  createdAt?: any;
  referredBy?: string;
}

export interface Message {
  role: 'user' | 'model' | 'admin';
  text: string;
  timestamp: any;
}
