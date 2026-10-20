import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  Sun,
  Snowflake,
  Baby,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import type { Product } from '../../types';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount, subtotal, openCart } = useCart();
  const { wishlist } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Click outside to close search popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products || []);
          setIsSearchOpen(true);
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'All Shop', path: '/shop' },
    {
      label: 'Summer Wear',
      path: '/collections/summer',
      icon: <Sun className="w-3.5 h-3.5 text-amber-500" />,
    },
    {
      label: 'Winter Wear',
      path: '/collections/winter',
      icon: <Snowflake className="w-3.5 h-3.5 text-sky-500" />,
    },
    { label: 'Boys', path: '/shop?gender=boys' },
    { label: 'Girls', path: '/shop?gender=girls' },
    {
      label: 'Baby (0-24M)',
      path: '/shop?category=baby',
      icon: <Baby className="w-3.5 h-3.5 text-rose-400" />,
    },
    { label: 'Track Order', path: '/track-order' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Left: Mobile Menu Button & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-amber-500 rounded-lg hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Logo size="md" />
          </div>

          {/* Center: Live Product Search */}
          <div ref={searchRef} className="hidden md:block flex-1 max-w-md relative">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search summer tees, winter jackets, frocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) setIsSearchOpen(true);
                  }}
                  className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 pl-10 pr-10 py-2.5 rounded-full text-sm placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all shadow-inner"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Search Dropdown Popover */}
            {isSearchOpen && (searchResults.length > 0 || isSearching) && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>
                    {isSearching ? 'Searching collections...' : `Found ${searchResults.length} matches`}
                  </span>
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
                    }}
                    className="text-amber-600 hover:underline"
                  >
                    View all results →
                  </button>
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.slug}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-3 p-3 hover:bg-amber-50/50 transition-colors"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {product.name}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span className="capitalize">{product.season}</span>
                          <span>·</span>
                          <span className="capitalize">{product.category}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">
                          Rs. {(product.salePrice ?? product.regularPrice).toLocaleString()}
                        </div>
                        {product.salePrice && (
                          <div className="text-xs text-slate-400 line-through">
                            Rs. {product.regularPrice.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Action Icons: Wishlist, Admin, Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist Icon */}
            <Link
              to="/shop?wishlist=true"
              className="relative p-2.5 text-slate-700 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Admin Dashboard Quick Link */}
            <Link
              to="/admin"
              className="p-2.5 text-slate-700 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
              title="Store Admin Dashboard"
            >
              <ShieldCheck className="w-5 h-5" />
            </Link>

            {/* Shopping Cart Button */}
            <button
              onClick={openCart}
              className="flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white pl-3.5 pr-4 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow"
              aria-label="Open Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black w-4 h-4 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold font-mono">
                Rs. {subtotal.toLocaleString()}
              </span>
            </button>
          </div>
        </div>

        {/* Desktop Main Navigation Links Bar */}
        <nav className="hidden lg:flex items-center justify-center gap-1 py-2 border-t border-slate-100 text-sm font-medium text-slate-600">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all duration-150 ${
                  active
                    ? 'text-slate-950 font-semibold bg-amber-50/80 shadow-sm'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
          {/* Mobile Search Input */}
          <div className="mb-4">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search kids clothing..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </form>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-amber-100/60 text-slate-950 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  {link.icon}
                  <span>{link.label}</span>
                </div>
                <span className="text-slate-400">→</span>
              </Link>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link to="/about" className="hover:text-amber-600">
              About Us
            </Link>
            <Link to="/contact" className="hover:text-amber-600">
              WhatsApp Support
            </Link>
            <Link to="/policies/shipping" className="hover:text-amber-600">
              Shipping & Returns
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
