import React, { createContext, useContext, useState, useEffect } from 'react';
import type { StoreSettings } from '../types';

interface StoreContextType {
  settings: StoreSettings | null;
  loadingSettings: boolean;
  wishlist: string[]; // array of product IDs
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  refreshSettings: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bkd_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to load store settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('bkd_wishlist', JSON.stringify(wishlist));
    } catch (err) {
      console.error('Failed to save wishlist:', err);
    }
  }, [wishlist]);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <StoreContext.Provider
      value={{
        settings,
        loadingSettings,
        wishlist,
        toggleWishlist,
        isInWishlist,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
