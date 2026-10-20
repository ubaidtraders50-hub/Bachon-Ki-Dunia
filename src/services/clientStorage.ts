import type { Product, StoreSettings, Coupon, Order } from '../types';
import { SEED_PRODUCTS, SEED_SETTINGS, SEED_COUPONS, SEED_ORDERS } from '../data/seedData';

const PRODUCTS_KEY = 'bkd_products_db';
const SETTINGS_KEY = 'bkd_settings_db';
const ORDERS_KEY = 'bkd_orders_db';
const COUPONS_KEY = 'bkd_coupons_db';

export class ClientStorage {
  public static getProducts(): Product[] {
    try {
      const data = localStorage.getItem(PRODUCTS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Storage read failed', e);
    }
    // Seed initial products
    this.saveProducts(SEED_PRODUCTS);
    return SEED_PRODUCTS;
  }

  public static saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    } catch (e) {
      console.warn('Storage save products failed', e);
    }
  }

  public static getSettings(): StoreSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && parsed.storeName) return parsed;
      }
    } catch (e) {
      console.warn('Storage read settings failed', e);
    }
    this.saveSettings(SEED_SETTINGS);
    return SEED_SETTINGS;
  }

  public static saveSettings(settings: Partial<StoreSettings>): StoreSettings {
    const current = this.getSettings();
    const updated = {
      ...current,
      ...settings,
      bankDetails: {
        ...current.bankDetails,
        ...(settings.bankDetails || {}),
      },
    };
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage save settings failed', e);
    }
    return updated;
  }

  public static getOrders(): Order[] {
    try {
      const data = localStorage.getItem(ORDERS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Storage read orders failed', e);
    }
    this.saveOrders(SEED_ORDERS);
    return SEED_ORDERS;
  }

  public static saveOrders(orders: Order[]): void {
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {
      console.warn('Storage save orders failed', e);
    }
  }

  public static getCoupons(): Coupon[] {
    try {
      const data = localStorage.getItem(COUPONS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Storage read coupons failed', e);
    }
    return SEED_COUPONS;
  }
}
