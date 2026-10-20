import fs from 'node:fs';
import path from 'node:path';
import type { Product, Order, Coupon, StoreSettings, AdminUser, Category } from './types.js';
import { hashPassword } from './auth.js';

interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  settings: StoreSettings;
  admins: AdminUser[];
}

// Initial Default Categories
export const defaultCategories: Category[] = [
  {
    id: 'cat-sets',
    name: 'Matching Sets',
    slug: 'sets',
    description: 'Coordinated 2-piece and 3-piece outfits for boys and girls',
    imageUrl: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    order: 1,
  },
  {
    id: 'cat-dresses',
    name: 'Dresses & Frocks',
    slug: 'dresses',
    description: 'Festive frocks, party dresses, and casual summer cottons',
    imageUrl: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    order: 2,
  },
  {
    id: 'cat-jackets',
    name: 'Jackets & Hoodies',
    slug: 'jackets',
    description: 'Quilted winter puffer jackets, cozy zip hoodies, and windbreakers',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    order: 3,
  },
  {
    id: 'cat-sweaters',
    name: 'Sweaters & Knitwear',
    slug: 'sweaters',
    description: 'Warm acrylic and wool blend cardigans and pull-overs',
    imageUrl: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    order: 4,
  },
  {
    id: 'cat-baby',
    name: 'Baby Wear (0-24M)',
    slug: 'baby',
    description: 'Soft combed cotton rompers, bodysuits, and newborn essentials',
    imageUrl: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    order: 5,
  },
  {
    id: 'cat-tshirts',
    name: 'T-Shirts & Tops',
    slug: 'tshirts',
    description: 'Fun graphic tees, polo shirts, and comfortable everyday tops',
    imageUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    order: 6,
  },
  {
    id: 'cat-trousers',
    name: 'Trousers & Pants',
    slug: 'trousers',
    description: 'Elasticated cotton joggers, denim jeans, and comfortable pants',
    imageUrl: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    order: 7,
  },
  {
    id: 'cat-accessories',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Kids beanies, caps, socks, and bibs',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    order: 8,
  },
];


const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Initial Store Settings
const defaultSettings: StoreSettings = {
  storeName: 'Bachon Ki Dunia',
  tagline: 'Little Clothes, Big Smiles!',
  phone: '+923136180608',
  whatsapp: '+923136180608',
  email: 'bachonkidunia50@gmail.com',
  address: 'Shop # 14-16, Kids Fashion Avenue, Gulberg III, Lahore, Pakistan',
  currency: 'PKR',
  currencySymbol: 'Rs.',
  defaultShippingFee: 250,
  freeShippingThreshold: 3500,
  announcementText: '✨ Summer & Winter Collection 2026 is LIVE! | Free Delivery across Pakistan on orders above Rs. 3,500 | Use Code WELCOME10 for 10% OFF',
  isAnnouncementActive: true,
  enableCod: true,
  enableBankTransfer: true,
  adminAlertWhatsapp: '03244422742',
  adminAlertEmail: 'bachonkidunia50@gmail.com',
  bankDetails: {
    bankName: 'JazzCash',
    accountTitle: 'Salman Siddiqui',
    accountNumber: '03244422742',
    iban: 'PK00JCAS03244422742',
    instructions: 'Please transfer via JazzCash to Salman Siddiqui (03244422742) and share payment screenshot on WhatsApp (03244422742) with your Order ID.',
  },
};

// Initial Coupons
const defaultCoupons: Coupon[] = [
  {
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 1500,
    isActive: true,
  },
  {
    code: 'BKD500',
    discountType: 'fixed',
    discountValue: 500,
    minOrderValue: 4000,
    isActive: true,
  },
  {
    code: 'WINTERWARM',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 5000,
    isActive: true,
  },
];

// Rich Initial Products
const defaultProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'Kids Dino Safari Cotton Tee & Shorts Set',
    slug: 'kids-dino-safari-cotton-tee-shorts-set',
    description: 'An ultra-comfortable 2-piece summer playtime set crafted from 100% combed breathable cotton. Features delightful dinosaur illustrations and an elasticized drawstring waist.',
    category: 'sets',
    season: 'summer',
    gender: 'boys',
    regularPrice: 2490,
    salePrice: 1990,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    fabric: '100% Breathable Combed Cotton (Oeko-Tex Standard)',
    careInstructions: 'Machine wash cold with mild detergent. Do not bleach. Tumble dry low.',
    images: [
      'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80',
    ],
    variations: [
      {
        id: 'var-001-navy-1-2y',
        colorName: 'Navy Blue',
        colorHex: '#1E293B',
        size: '1-2 Years',
        sku: 'BKD-SS26-DINO-NV-12Y',
        stock: 12,
        imageUrl: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-001-navy-2-3y',
        colorName: 'Navy Blue',
        colorHex: '#1E293B',
        size: '2-3 Years',
        sku: 'BKD-SS26-DINO-NV-23Y',
        stock: 18,
        imageUrl: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-001-navy-3-4y',
        colorName: 'Navy Blue',
        colorHex: '#1E293B',
        size: '3-4 Years',
        sku: 'BKD-SS26-DINO-NV-34Y',
        stock: 9,
        imageUrl: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-001-yellow-1-2y',
        colorName: 'Sunshine Yellow',
        colorHex: '#FBBF24',
        size: '1-2 Years',
        sku: 'BKD-SS26-DINO-YL-12Y',
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-001-yellow-2-3y',
        colorName: 'Sunshine Yellow',
        colorHex: '#FBBF24',
        size: '2-3 Years',
        sku: 'BKD-SS26-DINO-YL-23Y',
        stock: 14,
        imageUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-001-yellow-3-4y',
        colorName: 'Sunshine Yellow',
        colorHex: '#FBBF24',
        size: '3-4 Years',
        sku: 'BKD-SS26-DINO-YL-34Y',
        stock: 10,
        imageUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-001-mint-2-3y',
        colorName: 'Mint Green',
        colorHex: '#6EE7B7',
        size: '2-3 Years',
        sku: 'BKD-SS26-DINO-MT-23Y',
        stock: 8,
        imageUrl: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80',
      },
    ],
    rating: 4.9,
    reviewCount: 38,
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'prod-002',
    name: 'Girls Meadow Blossom Tiered Flutter Dress',
    slug: 'girls-meadow-blossom-tiered-flutter-dress',
    description: 'A charming, twirl-worthy vintage floral dress with delicate flutter sleeves, mother-of-pearl back buttons, and pure cotton lining for maximum summer cooling.',
    category: 'dresses',
    season: 'summer',
    gender: 'girls',
    regularPrice: 2890,
    salePrice: 2350,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    fabric: '100% Lightweight Cotton Lawn with Soft Voile Lining',
    careInstructions: 'Gentle hand wash or machine cycle in cold water. Iron on reverse side.',
    images: [
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    ],
    variations: [
      {
        id: 'var-002-blush-2-3y',
        colorName: 'Blush Pink',
        colorHex: '#F472B6',
        size: '2-3 Years',
        sku: 'BKD-SS26-FLUT-PK-23Y',
        stock: 14,
        imageUrl: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-002-blush-3-4y',
        colorName: 'Blush Pink',
        colorHex: '#F472B6',
        size: '3-4 Years',
        sku: 'BKD-SS26-FLUT-PK-34Y',
        stock: 11,
        imageUrl: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-002-blush-4-5y',
        colorName: 'Blush Pink',
        colorHex: '#F472B6',
        size: '4-5 Years',
        sku: 'BKD-SS26-FLUT-PK-45Y',
        stock: 7,
        imageUrl: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-002-lavender-2-3y',
        colorName: 'Lavender Mist',
        colorHex: '#C084FC',
        size: '2-3 Years',
        sku: 'BKD-SS26-FLUT-LV-23Y',
        stock: 9,
        imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-002-lavender-3-4y',
        colorName: 'Lavender Mist',
        colorHex: '#C084FC',
        size: '3-4 Years',
        sku: 'BKD-SS26-FLUT-LV-34Y',
        stock: 12,
        imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-002-cream-3-4y',
        colorName: 'Butter Cream',
        colorHex: '#FEF08A',
        size: '3-4 Years',
        sku: 'BKD-SS26-FLUT-CR-34Y',
        stock: 6,
        imageUrl: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=800&q=80',
      },
    ],
    rating: 4.8,
    reviewCount: 29,
    createdAt: '2026-03-02T11:00:00Z',
  },
  {
    id: 'prod-003',
    name: 'Baby Cloud Soft Pure Cotton Kimono Romper',
    slug: 'baby-cloud-soft-pure-cotton-kimono-romper',
    description: 'Designed specially for delicate newborn skin. Wrap-style snap buttons allow hassle-free diaper changes without pulling over baby head. Certified hypoallergenic and tag-free.',
    category: 'baby',
    season: 'all',
    gender: 'unisex',
    regularPrice: 1650,
    salePrice: 1290,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    fabric: '100% GOTS Certified Organic Ribbed Cotton',
    careInstructions: 'Machine wash 30°C. Gentle baby detergent. Do not dry clean.',
    images: [
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    ],
    variations: [
      {
        id: 'var-003-cream-0-3m',
        colorName: 'Oatmeal Cream',
        colorHex: '#F5F5DC',
        size: '0-3 Months',
        sku: 'BKD-BB26-KIMO-CR-03M',
        stock: 20,
        imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-003-cream-3-6m',
        colorName: 'Oatmeal Cream',
        colorHex: '#F5F5DC',
        size: '3-6 Months',
        sku: 'BKD-BB26-KIMO-CR-36M',
        stock: 16,
        imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-003-cream-6-12m',
        colorName: 'Oatmeal Cream',
        colorHex: '#F5F5DC',
        size: '6-12 Months',
        sku: 'BKD-BB26-KIMO-CR-612M',
        stock: 14,
        imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-003-sage-0-3m',
        colorName: 'Sage Green',
        colorHex: '#A7F3D0',
        size: '0-3 Months',
        sku: 'BKD-BB26-KIMO-SG-03M',
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-003-sage-3-6m',
        colorName: 'Sage Green',
        colorHex: '#A7F3D0',
        size: '3-6 Months',
        sku: 'BKD-BB26-KIMO-SG-36M',
        stock: 12,
        imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-003-dustyrose-3-6m',
        colorName: 'Dusty Rose',
        colorHex: '#FDA4AF',
        size: '3-6 Months',
        sku: 'BKD-BB26-KIMO-DR-36M',
        stock: 10,
        imageUrl: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=800&q=80',
      },
    ],
    rating: 5.0,
    reviewCount: 45,
    createdAt: '2026-03-03T12:00:00Z',
  },
  {
    id: 'prod-004',
    name: 'Cozy Bear Teddy Sherpa Hooded Winter Jacket',
    slug: 'cozy-bear-teddy-sherpa-hooded-winter-jacket',
    description: 'Thick, ultra-warm plush teddy fleece with adorable 3D bear ears on the hood, quilted cotton interior lining, and smooth snag-free safety zipper.',
    category: 'jackets',
    season: 'winter',
    gender: 'unisex',
    regularPrice: 4490,
    salePrice: 3690,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    fabric: 'Heavyweight Sherpa Fleece with 100% Cotton Thermal Inner',
    careInstructions: 'Machine wash on delicate cold cycle. Hang to dry. Do not iron directly on fleece.',
    images: [
      'https://images.unsplash.com/photo-1471286174890-9c112ffca56a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514995669114-6081e934b693?auto=format&fit=crop&w=800&q=80',
    ],
    variations: [
      {
        id: 'var-004-camel-1-2y',
        colorName: 'Warm Caramel',
        colorHex: '#D97706',
        size: '1-2 Years',
        sku: 'BKD-WN26-TEDY-CR-12Y',
        stock: 8,
        imageUrl: 'https://images.unsplash.com/photo-1471286174890-9c112ffca56a?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-004-camel-2-3y',
        colorName: 'Warm Caramel',
        colorHex: '#D97706',
        size: '2-3 Years',
        sku: 'BKD-WN26-TEDY-CR-23Y',
        stock: 11,
        imageUrl: 'https://images.unsplash.com/photo-1471286174890-9c112ffca56a?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-004-camel-3-4y',
        colorName: 'Warm Caramel',
        colorHex: '#D97706',
        size: '3-4 Years',
        sku: 'BKD-WN26-TEDY-CR-34Y',
        stock: 5,
        imageUrl: 'https://images.unsplash.com/photo-1471286174890-9c112ffca56a?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-004-navy-2-3y',
        colorName: 'Midnight Navy',
        colorHex: '#1E293B',
        size: '2-3 Years',
        sku: 'BKD-WN26-TEDY-NV-23Y',
        stock: 9,
        imageUrl: 'https://images.unsplash.com/photo-1514995669114-6081e934b693?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-004-navy-3-4y',
        colorName: 'Midnight Navy',
        colorHex: '#1E293B',
        size: '3-4 Years',
        sku: 'BKD-WN26-TEDY-NV-34Y',
        stock: 7,
        imageUrl: 'https://images.unsplash.com/photo-1514995669114-6081e934b693?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-004-navy-4-5y',
        colorName: 'Midnight Navy',
        colorHex: '#1E293B',
        size: '4-5 Years',
        sku: 'BKD-WN26-TEDY-NV-45Y',
        stock: 4,
        imageUrl: 'https://images.unsplash.com/photo-1514995669114-6081e934b693?auto=format&fit=crop&w=800&q=80',
      },
    ],
    rating: 4.9,
    reviewCount: 52,
    createdAt: '2026-03-04T13:00:00Z',
  },
  {
    id: 'prod-005',
    name: 'Little Gentleman Cable Knit Woolen Pullover',
    slug: 'little-gentleman-cable-knit-woolen-pullover',
    description: 'Classic heritage cable-knit crewneck sweater made with cashmere-cotton blend yarn that is soft, non-itchy, and keeps kids pleasantly warm during chilly Pakistan evenings.',
    category: 'sweaters',
    season: 'winter',
    gender: 'boys',
    regularPrice: 3200,
    salePrice: 2650,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: false,
    fabric: 'Soft Cotton-Wool Non-Itch Cashmere Touch Yarn',
    careInstructions: 'Hand wash cold or wool cycle. Dry flat to maintain shape.',
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80',
    ],
    variations: [
      {
        id: 'var-005-burgundy-2-3y',
        colorName: 'Deep Burgundy',
        colorHex: '#991B1B',
        size: '2-3 Years',
        sku: 'BKD-WN26-CABL-BG-23Y',
        stock: 10,
        imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-005-burgundy-3-4y',
        colorName: 'Deep Burgundy',
        colorHex: '#991B1B',
        size: '3-4 Years',
        sku: 'BKD-WN26-CABL-BG-34Y',
        stock: 8,
        imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-005-mustard-2-3y',
        colorName: 'Warm Mustard',
        colorHex: '#CA8A04',
        size: '2-3 Years',
        sku: 'BKD-WN26-CABL-MS-23Y',
        stock: 12,
        imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-005-mustard-3-4y',
        colorName: 'Warm Mustard',
        colorHex: '#CA8A04',
        size: '3-4 Years',
        sku: 'BKD-WN26-CABL-MS-34Y',
        stock: 6,
        imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-005-mustard-4-5y',
        colorName: 'Warm Mustard',
        colorHex: '#CA8A04',
        size: '4-5 Years',
        sku: 'BKD-WN26-CABL-MS-45Y',
        stock: 5,
        imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80',
      },
    ],
    rating: 4.7,
    reviewCount: 22,
    createdAt: '2026-03-05T14:00:00Z',
  },
  {
    id: 'prod-006',
    name: 'Girls Velvet Twilight Holiday Festive Frock',
    slug: 'girls-velvet-twilight-holiday-festive-frock',
    description: 'Exquisite crushed velvet party frock with golden lace trim collar, satin inner lining, and gathered waist skirt. Perfect for Eid, weddings, and winter celebrations.',
    category: 'dresses',
    season: 'winter',
    gender: 'girls',
    regularPrice: 3950,
    salePrice: 3250,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    fabric: 'Premium Plush Micro-Velvet with Pure Cotton Lining',
    careInstructions: 'Dry clean recommended or gentle cold hand wash. Steam iron inside out.',
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=800&q=80',
    ],
    variations: [
      {
        id: 'var-006-emerald-3-4y',
        colorName: 'Emerald Green',
        colorHex: '#047857',
        size: '3-4 Years',
        sku: 'BKD-WN26-VELV-EM-34Y',
        stock: 9,
        imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-006-emerald-4-5y',
        colorName: 'Emerald Green',
        colorHex: '#047857',
        size: '4-5 Years',
        sku: 'BKD-WN26-VELV-EM-45Y',
        stock: 11,
        imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-006-ruby-3-4y',
        colorName: 'Ruby Red',
        colorHex: '#B91C1C',
        size: '3-4 Years',
        sku: 'BKD-WN26-VELV-RB-34Y',
        stock: 14,
        imageUrl: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-006-ruby-4-5y',
        colorName: 'Ruby Red',
        colorHex: '#B91C1C',
        size: '4-5 Years',
        sku: 'BKD-WN26-VELV-RB-45Y',
        stock: 7,
        imageUrl: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=800&q=80',
      },
    ],
    rating: 4.9,
    reviewCount: 31,
    createdAt: '2026-03-06T15:00:00Z',
  },
  {
    id: 'prod-007',
    name: 'Boys Streetwear Cargo Joggers & Hooded Tee Set',
    slug: 'boys-streetwear-cargo-joggers-hooded-tee-set',
    description: 'Contemporary two-piece streetwear set featuring elastic ankle ribbed cargo joggers with dual pockets and a lightweight French Terry half-sleeve hooded top.',
    category: 'sets',
    season: 'summer',
    gender: 'boys',
    regularPrice: 2990,
    salePrice: 2450,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: true,
    fabric: 'Breathable Cotton Lycra Twill & Soft French Terry',
    careInstructions: 'Machine wash 40°C. Medium iron. Do not tumble dry high.',
    images: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1471286174890-9c112ffca56a?auto=format&fit=crop&w=800&q=80',
    ],
    variations: [
      {
        id: 'var-007-olive-2-3y',
        colorName: 'Military Olive',
        colorHex: '#4D7C0F',
        size: '2-3 Years',
        sku: 'BKD-SS26-CARG-OL-23Y',
        stock: 10,
        imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-007-olive-3-4y',
        colorName: 'Military Olive',
        colorHex: '#4D7C0F',
        size: '3-4 Years',
        sku: 'BKD-SS26-CARG-OL-34Y',
        stock: 12,
        imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-007-olive-4-5y',
        colorName: 'Military Olive',
        colorHex: '#4D7C0F',
        size: '4-5 Years',
        sku: 'BKD-SS26-CARG-OL-45Y',
        stock: 8,
        imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-007-charcoal-3-4y',
        colorName: 'Charcoal Grey',
        colorHex: '#374151',
        size: '3-4 Years',
        sku: 'BKD-SS26-CARG-CH-34Y',
        stock: 9,
        imageUrl: 'https://images.unsplash.com/photo-1471286174890-9c112ffca56a?auto=format&fit=crop&w=800&q=80',
      },
    ],
    rating: 4.8,
    reviewCount: 19,
    createdAt: '2026-03-07T16:00:00Z',
  },
  {
    id: 'prod-008',
    name: 'Kids Thermal Heavy Fleece Windproof Puffer Vest',
    slug: 'kids-thermal-heavy-fleece-windproof-puffer-vest',
    description: 'Lightweight yet thermal sleeveless puffer gilet jacket filled with duck-down imitation microfiber. Water-repellent shell with fleece lined standing collar.',
    category: 'jackets',
    season: 'winter',
    gender: 'unisex',
    regularPrice: 3450,
    salePrice: 2850,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    fabric: 'Windproof Taslan Poly Shell with Microfiber Down Fill',
    careInstructions: 'Spot clean or cold machine wash gentle. Air dry flat.',
    images: [
      'https://images.unsplash.com/photo-1514995669114-6081e934b693?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80',
    ],
    variations: [
      {
        id: 'var-008-yellow-2-3y',
        colorName: 'Bright Mustard',
        colorHex: '#EAB308',
        size: '2-3 Years',
        sku: 'BKD-WN26-PUFF-YL-23Y',
        stock: 14,
        imageUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-008-yellow-3-4y',
        colorName: 'Bright Mustard',
        colorHex: '#EAB308',
        size: '3-4 Years',
        sku: 'BKD-WN26-PUFF-YL-34Y',
        stock: 10,
        imageUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'var-008-navy-3-4y',
        colorName: 'Navy Blue',
        colorHex: '#1E3A8A',
        size: '3-4 Years',
        sku: 'BKD-WN26-PUFF-NV-34Y',
        stock: 11,
        imageUrl: 'https://images.unsplash.com/photo-1514995669114-6081e934b693?auto=format&fit=crop&w=800&q=80',
      },
    ],
    rating: 4.8,
    reviewCount: 26,
    createdAt: '2026-03-08T17:00:00Z',
  },
];

// Persistent File DB Manager
class DatabaseManager {
  private inMemoryCache: DatabaseSchema | null = null;
  private isWriting = false;

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const defaultAdminPass = process.env.ADMIN_DEFAULT_PASSWORD || 'BachonAdmin2026!';
      const { hash, salt } = hashPassword(defaultAdminPass);
      const initialAdmin: AdminUser = {
        id: 'admin-001',
        username: 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@bachonkidunia.com',
        passwordHash: hash,
        salt,
        role: 'admin',
        createdAt: new Date().toISOString(),
      };

      const initialDb: DatabaseSchema = {
        products: defaultProducts,
        orders: [
          {
            id: 'BKD-2026-8941',
            customer: {
              fullName: 'Ayesha Tariq',
              phone: '03001234567',
              email: 'ayesha.tariq@gmail.com',
              address: 'House # 42, Street 7, Block F, DHA Phase 5',
              city: 'Lahore',
              province: 'Punjab',
              postalCode: '54000',
              orderNotes: 'Please ring the doorbell twice',
            },
            items: [
              {
                productId: 'prod-001',
                productName: 'Kids Dino Safari Cotton Tee & Shorts Set',
                productSlug: 'kids-dino-safari-cotton-tee-shorts-set',
                variationId: 'var-001-navy-2-3y',
                colorName: 'Navy Blue',
                size: '2-3 Years',
                sku: 'BKD-SS26-DINO-NV-23Y',
                unitPrice: 1990,
                quantity: 1,
                subtotal: 1990,
                imageUrl: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
              },
              {
                productId: 'prod-003',
                productName: 'Baby Cloud Soft Pure Cotton Kimono Romper',
                productSlug: 'baby-cloud-soft-pure-cotton-kimono-romper',
                variationId: 'var-003-cream-3-6m',
                colorName: 'Oatmeal Cream',
                size: '3-6 Months',
                sku: 'BKD-BB26-KIMO-CR-36M',
                unitPrice: 1290,
                quantity: 1,
                subtotal: 1290,
                imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80',
              },
            ],
            subtotal: 3280,
            shippingFee: 250,
            discount: 0,
            total: 3530,
            status: 'confirmed',
            paymentMethod: 'cod',
            paymentStatus: 'pending',
            courierName: 'Trax Logistics',
            trackingNumber: 'TRX-94817263',
            createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          },
        ],
        categories: defaultCategories,
        coupons: defaultCoupons,
        settings: defaultSettings,
        admins: [initialAdmin],
      };

      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      this.inMemoryCache = initialDb;
    } else {
      // If DB file exists, ensure categories are initialized if absent
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        let modified = false;
        if (!parsed.categories || !Array.isArray(parsed.categories) || parsed.categories.length === 0) {
          parsed.categories = defaultCategories;
          modified = true;
        }
        if (modified) {
          fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
        }
        this.inMemoryCache = parsed;
      } catch (err) {
        console.error('Error inspecting existing DB file:', err);
      }
    }
  }

  public read(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed: DatabaseSchema = JSON.parse(data);
        if (!parsed.categories || !Array.isArray(parsed.categories)) {
          parsed.categories = defaultCategories;
        }
        this.inMemoryCache = parsed;
        return parsed;
      }
    } catch (err) {
      console.warn('DB read fallback to cache:', err);
    }

    if (this.inMemoryCache) {
      return this.inMemoryCache;
    }

    this.ensureInitialized();
    return this.inMemoryCache!;
  }

  public write(data: DatabaseSchema): void {
    this.inMemoryCache = data;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing database to disk:', err);
    }
  }

  // Helper transaction lock for atomic updates
  public transaction<T>(callback: (db: DatabaseSchema) => { result: T; updatedDb?: DatabaseSchema }): T {
    const db = this.read();
    const { result, updatedDb } = callback(db);
    if (updatedDb) {
      this.write(updatedDb);
    }
    return result;
  }
}

export const db = new DatabaseManager();
