import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Product, ProductVariation } from '../types';
import { useStore } from './StoreContext';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variation: ProductVariation, quantity?: number) => void;
  updateQuantity: (variationId: string, quantity: number) => void;
  removeFromCart: (variationId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  // Coupon
  couponCode: string;
  couponDiscount: number;
  couponMessage: string | null;
  couponError: string | null;
  isApplyingCoupon: boolean;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  // Calculations
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  itemCount: number;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  isFreeShippingEligible: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useStore();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('bkd_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState<string>(() => {
    try {
      return localStorage.getItem('bkd_coupon_code') || '';
    } catch {
      return '';
    }
  });
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bkd_cart', JSON.stringify(items));
    } catch (err) {
      console.error('Failed to save cart to localStorage', err);
    }
  }, [items]);

  useEffect(() => {
    try {
      if (couponCode) {
        localStorage.setItem('bkd_coupon_code', couponCode);
      } else {
        localStorage.removeItem('bkd_coupon_code');
      }
    } catch (err) {
      console.error('Failed to save coupon code to localStorage', err);
    }
  }, [couponCode]);

  // Derived financial computations
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const freeShippingThreshold = settings?.freeShippingThreshold ?? 3500;
  const defaultShippingFee = settings?.defaultShippingFee ?? 250;

  const isFreeShippingEligible = subtotal >= freeShippingThreshold && items.length > 0;
  const shippingFee = items.length === 0 ? 0 : isFreeShippingEligible ? 0 : defaultShippingFee;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  // Recalculate coupon discount whenever subtotal or couponCode changes
  useEffect(() => {
    if (!couponCode || subtotal === 0) {
      setCouponDiscount(0);
      setCouponMessage(null);
      return;
    }

    const revalidate = async () => {
      try {
        const res = await fetch('/api/coupons/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: couponCode, subtotal }),
        });
        const data = await res.json();
        if (res.ok && data.valid) {
          setCouponDiscount(data.discountAmount);
          setCouponMessage(data.message);
          setCouponError(null);
        } else {
          setCouponDiscount(0);
          setCouponError(data.error || 'Coupon condition not met.');
        }
      } catch {
        // network issue
      }
    };

    revalidate();
  }, [subtotal, couponCode]);

  const discount = Math.min(couponDiscount, subtotal);
  const total = Math.max(0, subtotal - discount + shippingFee);

  const addToCart = (product: Product, variation: ProductVariation, quantity: number = 1) => {
    if (variation.stock <= 0) return;

    setItems((prevItems) => {
      const existingIdx = prevItems.findIndex((i) => i.variationId === variation.id);
      const unitPrice = variation.priceOverride ?? product.salePrice ?? product.regularPrice;

      if (existingIdx > -1) {
        const existing = prevItems[existingIdx];
        const newQty = Math.min(existing.quantity + quantity, variation.stock);
        const updated = [...prevItems];
        updated[existingIdx] = {
          ...existing,
          quantity: newQty,
          maxStock: variation.stock,
          unitPrice,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          variationId: variation.id,
          colorName: variation.colorName,
          colorHex: variation.colorHex,
          size: variation.size,
          sku: variation.sku,
          unitPrice,
          quantity: Math.min(quantity, variation.stock),
          maxStock: variation.stock,
          imageUrl: variation.imageUrl || product.images[0] || '',
        };
        return [...prevItems, newItem];
      }
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (variationId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variationId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.variationId === variationId) {
          return {
            ...item,
            quantity: Math.min(quantity, item.maxStock),
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (variationId: string) => {
    setItems((prev) => prev.filter((i) => i.variationId !== variationId));
  };

  const clearCart = () => {
    setItems([]);
    setCouponDiscount(0);
    setCouponMessage(null);
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setCouponError('Please enter a coupon code.');
      return false;
    }

    setIsApplyingCoupon(true);
    setCouponError(null);
    setCouponMessage(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed, subtotal }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setCouponError(data.error || 'Invalid coupon code.');
        setCouponDiscount(0);
        return false;
      }

      setCouponCode(data.code);
      setCouponDiscount(data.discountAmount);
      setCouponMessage(data.message);
      return true;
    } catch {
      setCouponError('Could not validate coupon. Please try again.');
      return false;
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponMessage(null);
    setCouponError(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen((prev) => !prev),
        couponCode,
        couponDiscount,
        couponMessage,
        couponError,
        isApplyingCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        shippingFee,
        discount,
        total,
        itemCount,
        freeShippingThreshold,
        amountToFreeShipping,
        isFreeShippingEligible,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
