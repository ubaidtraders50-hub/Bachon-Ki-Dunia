import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  Search,
  Check,
  ChevronDown,
  RotateCcw,
  Sun,
  Snowflake,
  Baby,
} from 'lucide-react';
import { ProductCard } from '../components/common/ProductCard';
import type { Product } from '../types';
import { useStore } from '../context/StoreContext';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { wishlist } = useStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter States initialized from URL params
  const categoryParam = searchParams.get('category') || 'all';
  const seasonParam = searchParams.get('season') || 'all';
  const genderParam = searchParams.get('gender') || 'all';
  const sizeParam = searchParams.get('size') || '';
  const colorParam = searchParams.get('color') || '';
  const inStockParam = searchParams.get('inStock') === 'true';
  const sortParam = searchParams.get('sort') || 'newest';
  const searchParam = searchParams.get('search') || '';
  const wishlistOnly = searchParams.get('wishlist') === 'true';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';

  const [searchInput, setSearchInput] = useState(searchParam);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (searchParam) query.set('search', searchParam);
      if (categoryParam !== 'all') query.set('category', categoryParam);
      if (seasonParam !== 'all') query.set('season', seasonParam);
      if (genderParam !== 'all') query.set('gender', genderParam);
      if (sizeParam) query.set('size', sizeParam);
      if (colorParam) query.set('color', colorParam);
      if (inStockParam) query.set('inStock', 'true');
      if (minPriceParam) query.set('minPrice', minPriceParam);
      if (maxPriceParam) query.set('maxPrice', maxPriceParam);
      if (sortParam) query.set('sort', sortParam);

      const res = await fetch(`/api/products?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        let list: Product[] = data.products || [];
        if (wishlistOnly) {
          list = list.filter((p) => wishlist.includes(p.id));
        }
        setProducts(list);
        setTotalCount(list.length);
      }
    } catch (err) {
      console.error('Failed to load shop products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [
    categoryParam,
    seasonParam,
    genderParam,
    sizeParam,
    colorParam,
    inStockParam,
    sortParam,
    searchParam,
    wishlistOnly,
    minPriceParam,
    maxPriceParam,
  ]);

  const updateFilter = (key: string, value: string | boolean) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === 'all' || value === '' || value === false) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, String(value));
    }
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchInput('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', searchInput.trim());
  };

  // Filter options definitions
  const categories = [
    { label: 'All Categories', value: 'all' },
    { label: 'Matching Sets', value: 'sets' },
    { label: 'Dresses & Frocks', value: 'dresses' },
    { label: 'Jackets & Hoodies', value: 'jackets' },
    { label: 'Sweaters & Knits', value: 'sweaters' },
    { label: 'Baby Wear (0-24M)', value: 'baby' },
  ];

  const seasons = [
    { label: 'All Seasons', value: 'all' },
    { label: 'Summer Breeze', value: 'summer', icon: <Sun className="w-3.5 h-3.5 text-amber-500" /> },
    { label: 'Winter Warmth', value: 'winter', icon: <Snowflake className="w-3.5 h-3.5 text-sky-500" /> },
  ];

  const genders = [
    { label: 'All Genders', value: 'all' },
    { label: 'Boys', value: 'boys' },
    { label: 'Girls', value: 'girls' },
    { label: 'Unisex', value: 'unisex' },
  ];

  const sizes = ['0-3 Months', '3-6 Months', '6-12 Months', '1-2 Years', '2-3 Years', '3-4 Years', '4-5 Years'];

  const colors = [
    { name: 'Navy Blue', hex: '#1E293B' },
    { name: 'Sunshine Yellow', hex: '#FBBF24' },
    { name: 'Blush Pink', hex: '#F472B6' },
    { name: 'Mint Green', hex: '#6EE7B7' },
    { name: 'Cream / Oatmeal', hex: '#F5F5DC' },
    { name: 'Deep Burgundy', hex: '#991B1B' },
    { name: 'Military Olive', hex: '#4D7C0F' },
  ];

  const hasActiveFilters =
    categoryParam !== 'all' ||
    seasonParam !== 'all' ||
    genderParam !== 'all' ||
    sizeParam !== '' ||
    colorParam !== '' ||
    inStockParam ||
    searchParam !== '' ||
    wishlistOnly ||
    minPriceParam !== '' ||
    maxPriceParam !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Heading & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 font-['Outfit'] tracking-tight">
            {wishlistOnly ? 'My Wishlist' : 'Kids Clothing Collection'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {wishlistOnly
              ? `You have saved ${products.length} products to your wishlist.`
              : `Showing ${totalCount} premium pieces for babies, toddlers & kids.`}
          </p>
        </div>

        {/* Search Bar & Mobile Filter Trigger */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 pl-9 pr-8 py-2 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:border-amber-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateFilter('search', '');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </form>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortParam}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 py-2 pl-3 pr-8 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-400 cursor-pointer appearance-none shadow-xs"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popularity">Most Popular</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Active Filters Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 font-medium">Active Filters:</span>
          {searchParam && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg">
              Search: "{searchParam}"
              <button onClick={() => updateFilter('search', '')}>
                <X className="w-3 h-3 text-amber-700 hover:text-amber-950" />
              </button>
            </span>
          )}
          {categoryParam !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg capitalize">
              Category: {categoryParam}
              <button onClick={() => updateFilter('category', 'all')}>
                <X className="w-3 h-3 text-amber-700" />
              </button>
            </span>
          )}
          {seasonParam !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg capitalize">
              Season: {seasonParam}
              <button onClick={() => updateFilter('season', 'all')}>
                <X className="w-3 h-3 text-amber-700" />
              </button>
            </span>
          )}
          {genderParam !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg capitalize">
              Gender: {genderParam}
              <button onClick={() => updateFilter('gender', 'all')}>
                <X className="w-3 h-3 text-amber-700" />
              </button>
            </span>
          )}
          {sizeParam && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg">
              Size: {sizeParam}
              <button onClick={() => updateFilter('size', '')}>
                <X className="w-3 h-3 text-amber-700" />
              </button>
            </span>
          )}
          {colorParam && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg">
              Color: {colorParam}
              <button onClick={() => updateFilter('color', '')}>
                <X className="w-3 h-3 text-amber-700" />
              </button>
            </span>
          )}
          {inStockParam && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg">
              In Stock Only
              <button onClick={() => updateFilter('inStock', false)}>
                <X className="w-3 h-3 text-amber-700" />
              </button>
            </span>
          )}
          {wishlistOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-900 border border-rose-200 rounded-lg">
              Wishlist Only
              <button onClick={() => updateFilter('wishlist', false)}>
                <X className="w-3 h-3 text-rose-700" />
              </button>
            </span>
          )}

          <button
            onClick={clearAllFilters}
            className="text-xs text-rose-600 hover:text-rose-800 font-bold ml-2 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        </div>
      )}

      {/* Main Grid + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-6">
          {/* Season Filter */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">Season</h3>
            <div className="space-y-1">
              {seasons.map((s) => (
                <button
                  key={s.value}
                  onClick={() => updateFilter('season', s.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    seasonParam === s.value
                      ? 'bg-amber-100/70 text-slate-950 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {s.icon}
                    <span>{s.label}</span>
                  </div>
                  {seasonParam === s.value && <Check className="w-3.5 h-3.5 text-amber-700" />}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">Category</h3>
            <div className="space-y-1">
              {categories.map((c) => (
                <button
                  key={c.value}
                  onClick={() => updateFilter('category', c.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    categoryParam === c.value
                      ? 'bg-amber-100/70 text-slate-950 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{c.label}</span>
                  {categoryParam === c.value && <Check className="w-3.5 h-3.5 text-amber-700" />}
                </button>
              ))}
            </div>
          </div>

          {/* Gender Filter */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">Gender</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {genders.map((g) => (
                <button
                  key={g.value}
                  onClick={() => updateFilter('gender', g.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                    genderParam === g.value
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">Age / Size</h3>
            <div className="flex flex-wrap gap-1.5">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => updateFilter('size', sizeParam === s ? '' : s)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                    sizeParam === s
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">Color</h3>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => updateFilter('color', colorParam === c.name ? '' : c.name)}
                  className={`w-7 h-7 rounded-full border transition-transform flex items-center justify-center ${
                    colorParam === c.name
                      ? 'ring-2 ring-amber-500 scale-110 shadow-sm border-white'
                      : 'border-slate-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {colorParam === c.name && (
                    <Check
                      className={`w-3.5 h-3.5 ${
                        c.hex === '#F5F5DC' || c.hex === '#FBBF24' ? 'text-slate-900' : 'text-white'
                      }`}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* In Stock Only Checkbox */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={inStockParam}
                onChange={(e) => updateFilter('inStock', e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Cards Grid Area */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[4/5] bg-slate-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">No matching clothes found</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                We couldn't find items matching your active filter criteria. Try clearing some filters or searching for something else.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto lg:hidden">
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />
          <div className="relative min-h-screen flex items-end">
            <div className="w-full bg-white rounded-t-3xl p-6 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-base">Filter Collections</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Season */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase text-slate-600">Season</div>
                <div className="flex gap-2">
                  {seasons.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => updateFilter('season', s.value)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border ${
                        seasonParam === s.value
                          ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase text-slate-600">Gender</div>
                <div className="grid grid-cols-2 gap-2">
                  {genders.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => updateFilter('gender', g.value)}
                      className={`py-2 rounded-xl text-xs font-semibold border ${
                        genderParam === g.value
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age / Size */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase text-slate-600">Age / Size</div>
                <div className="flex flex-wrap gap-1.5">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateFilter('size', sizeParam === s ? '' : s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                        sizeParam === s
                          ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 py-3 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-3 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold shadow-md"
                >
                  Show {totalCount} Items
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
