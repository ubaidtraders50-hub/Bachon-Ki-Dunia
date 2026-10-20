export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  order?: number;
}

export interface ProductVariation {
  id: string;
  colorName: string;
  colorHex: string;
  size: string; // e.g. "0-3M", "6-12M", "1-2Y", "2-3Y", "3-4Y", "4-5Y"
  sku: string;
  stock: number;
  priceOverride?: number;
  imageUrl: string;
  additionalImages?: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string; // "sets" | "jackets" | "sweaters" | "dresses" | "baby" | "tshirts" | "trousers"
  season: 'summer' | 'winter' | 'all';
  gender: 'boys' | 'girls' | 'unisex' | 'baby-boy' | 'baby-girl';
  regularPrice: number;
  salePrice?: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  fabric: string;
  careInstructions: string;
  images: string[];
  variations: ProductVariation[];
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  productSlug: string;
  variationId: string;
  colorName: string;
  colorHex: string;
  size: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
  imageUrl: string;
}

export interface CustomerDetails {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province?: string;
  postalCode?: string;
  orderNotes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productSlug: string;
  variationId: string;
  colorName: string;
  size: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'bank_transfer' | 'online_card';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  trackingNumber?: string;
  courierName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  isActive: boolean;
  expiryDate?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  currency: string;
  currencySymbol: string;
  defaultShippingFee: number;
  freeShippingThreshold: number;
  announcementText: string;
  isAnnouncementActive: boolean;
  enableCod: boolean;
  enableBankTransfer: boolean;
  adminAlertWhatsapp?: string;
  adminAlertEmail?: string;
  bankDetails: {
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
    instructions: string;
  };
}
