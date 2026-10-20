import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Sun, Snowflake, ArrowRight, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { ProductCard } from '../components/common/ProductCard';
import type { Product } from '../types';

export const CollectionPage: React.FC = () => {
  const location = useLocation();
  const isSummer = location.pathname.includes('/summer');
  const season = isSummer ? 'summer' : 'winter';

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeasonProducts = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        query.set('season', season);
        if (selectedGender !== 'all') {
          query.set('gender', selectedGender);
        }

        const res = await fetch(`/api/products?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error('Failed to load season products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeasonProducts();
  }, [season, selectedGender]);

  return (
    <div className="space-y-10 pb-16">
      {/* Thematic Hero Banner */}
      <section
        className={`relative overflow-hidden py-14 sm:py-20 px-4 sm:px-6 lg:px-8 ${
          isSummer
            ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950'
            : 'bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white'
        }`}
      >
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isSummer ? 'bg-white/90 text-amber-950' : 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
              }`}
            >
              {isSummer ? <Sun className="w-3.5 h-3.5 text-amber-600" /> : <Snowflake className="w-3.5 h-3.5 text-sky-400" />}
              <span>{isSummer ? 'Summer Collection 2026' : 'Winter Warmth Collection 2026'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-['Outfit']">
              {isSummer ? 'Sun-Ready Styles & Cotton Breeze' : 'Snug Sherpa Fleece & Cozy Knitwear'}
            </h1>

            <p
              className={`text-sm sm:text-base leading-relaxed ${
                isSummer ? 'text-slate-900 font-medium' : 'text-slate-300'
              }`}
            >
              {isSummer
                ? 'Lightweight 100% combed cottons, flutter sleeve dresses, and breathable play sets made to keep kids happy and cool in Pakistan’s warm summer season.'
                : 'Heavyweight teddy fleece jackets, non-itch cable knit pullovers, and luxurious velvet party frocks crafted for maximum warmth and celebratory charm.'}
            </p>

            <div className="flex items-center gap-4 pt-2 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4" />
                <span>Cash on Delivery Nationwide</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Skin-Safe Fabrics</span>
              </span>
            </div>
          </div>

          {/* Quick Sub-Category Nav */}
          <div className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
            {['all', 'boys', 'girls', 'unisex'].map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGender(g)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap text-left ${
                  selectedGender === g
                    ? isSummer
                      ? 'bg-slate-950 text-white shadow-md'
                      : 'bg-amber-400 text-slate-950 shadow-md'
                    : isSummer
                    ? 'bg-white/80 text-slate-800 hover:bg-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {g === 'all' ? `All ${isSummer ? 'Summer' : 'Winter'}` : `${g} Collection`}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-slate-900 text-xl font-['Outfit']">
            {selectedGender === 'all'
              ? `All ${isSummer ? 'Summer' : 'Winter'} Outfits`
              : `${selectedGender.toUpperCase()} - ${isSummer ? 'Summer' : 'Winter'} Collection`}
          </h2>
          <span className="text-xs text-slate-500 font-semibold">{products.length} Products</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/5] bg-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">No pieces currently in this view</h3>
            <p className="text-xs text-slate-500">Check back shortly or view our complete catalog.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              <span>Explore All Clothes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
