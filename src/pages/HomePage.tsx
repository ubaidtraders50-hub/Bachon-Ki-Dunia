import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sun,
  Snowflake,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RefreshCw,
  MessageCircle,
  Star,
  Check,
  Copy,
} from 'lucide-react';
import { ProductCard } from '../components/common/ProductCard';
import type { Product } from '../types';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'featured' | 'new' | 'summer' | 'winter'>('featured');
  const [loading, setLoading] = useState(true);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=12');
        if (res.ok) {
          const data = await res.json();
          const all = data.products || [];
          setFeaturedProducts(all.filter((p: Product) => p.isFeatured || p.isBestSeller));
          setNewArrivals(all.filter((p: Product) => p.isNewArrival));
        }
      } catch (err) {
        console.error('Failed to load homepage products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText('WELCOME10');
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  const displayedProducts =
    activeTab === 'new'
      ? newArrivals
      : activeTab === 'summer'
      ? featuredProducts.filter((p) => p.season === 'summer')
      : activeTab === 'winter'
      ? featuredProducts.filter((p) => p.season === 'winter')
      : featuredProducts;

  // Categories tiles data
  const categoryTiles = [
    {
      title: 'Boys Clothing',
      subtitle: 'Tees, Polos & Play Sets',
      image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=80',
      link: '/shop?gender=boys',
      color: 'from-blue-600/60',
    },
    {
      title: 'Girls Clothing',
      subtitle: 'Frocks, Sets & Party Wear',
      image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80',
      link: '/shop?gender=girls',
      color: 'from-rose-600/60',
    },
    {
      title: 'Baby Essentials',
      subtitle: '0-24 Months Soft Rompers',
      image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80',
      link: '/shop?category=baby',
      color: 'from-amber-600/60',
    },
    {
      title: 'Summer Breeze',
      subtitle: 'Lightweight Breathable Cottons',
      image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=600&q=80',
      link: '/collections/summer',
      color: 'from-yellow-600/60',
    },
    {
      title: 'Winter Warmth',
      subtitle: 'Cozy Sherpa, Knits & Puffer',
      image: 'https://images.unsplash.com/photo-1471286174890-9c112ffca56a?auto=format&fit=crop&w=600&q=80',
      link: '/collections/winter',
      color: 'from-sky-700/60',
    },
    {
      title: 'Matching Sets',
      subtitle: 'Effortless 2-Piece Combos',
      image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80',
      link: '/shop?category=sets',
      color: 'from-emerald-700/60',
    },
  ];

  // Testimonials
  const testimonials = [
    {
      quote:
        'The combed cotton dino set is so soft on my 2-year-old son’s sensitive skin! Delivered to Lahore in just 2 days with Cash on Delivery. Truly exceptional quality.',
      author: 'Fatima Z.',
      city: 'Lahore, Punjab',
      stars: 5,
      itemBought: 'Kids Dino Safari Set',
    },
    {
      quote:
        'I ordered the velvet winter frock for my daughter for a family wedding in Karachi. The fabric and stitching were boutique quality, and sizing was spot on!',
      author: 'Ayesha K.',
      city: 'Karachi, Sindh',
      stars: 5,
      itemBought: 'Girls Velvet Festive Frock',
    },
    {
      quote:
        'Super easy shopping experience. Loved that switching colors on the site instantly showed the exact variation photos. Will definitely be a returning customer.',
      author: 'Dr. Bilal Siddiqui',
      city: 'Islamabad',
      stars: 5,
      itemBought: 'Cozy Bear Teddy Jacket',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/60 via-[#FAF9F6] to-white pt-6 sm:pt-12 pb-14 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <img
                  src="/logo.jpg"
                  alt="Bachon Ki Dunia Official Logo"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-400 shadow-md object-cover bg-white p-0.5"
                />
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold tracking-wide uppercase shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Summer & Winter 2026 Collection</span>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.1] font-['Outfit']">
                Little Clothes, <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700">
                  Big Smiles!
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-['Plus_Jakarta_Sans']">
                Discover Pakistan’s favorite childrenswear destination. Ultra-breathable summer
                playwear, plush winter fleece, and festive charm tailored with hypoallergenic
                natural fibers for happy, energetic kids.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                <Link
                  to="/collections/summer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Sun className="w-4 h-4 text-slate-950" />
                  <span>Shop Summer Wear</span>
                </Link>

                <Link
                  to="/collections/winter"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Snowflake className="w-4 h-4 text-sky-400" />
                  <span>Explore Winter Wear</span>
                </Link>

                <Link
                  to="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 rounded-2xl text-sm transition-colors"
                >
                  <span>All Products</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-500" />
                  <span>Cash on Delivery Nationwide</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>100% Breathable Fabrics</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-sky-500" />
                  <span>7-Day Easy Exchange</span>
                </div>
              </div>
            </div>

            {/* Right Visual Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Card */}
                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white relative group">
                  <img
                    src="https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=1000&q=80"
                    alt="Happy kids wearing Bachon Ki Dunia summer wear"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
                      New Season Arrival
                    </span>
                    <h3 className="text-xl font-bold font-['Outfit'] mt-1">
                      Kids Safari Summer Collection
                    </h3>
                    <p className="text-xs text-slate-200 mt-1">Pure cotton coolness from Rs. 1,990</p>
                  </div>
                </div>

                {/* Floating Floating Promo Mini Card */}
                <div className="absolute -bottom-6 -left-6 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce-slow">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-black text-lg">
                    10%
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">First Order Discount</div>
                    <div className="text-[11px] text-slate-500 font-mono">Use code: WELCOME10</div>
                  </div>
                </div>

                {/* Floating Top Rating Card */}
                <div className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-xs py-2 px-3.5 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2">
                  <div className="flex text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">4.9/5 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY TILES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
              Curated Wardrobes
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 font-['Outfit']">
              Shop By Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-semibold text-slate-700 hover:text-amber-600 flex items-center gap-1 group"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categoryTiles.map((cat) => (
            <Link
              key={cat.title}
              to={cat.link}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 shadow-xs hover:shadow-lg transition-all duration-300"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t ${cat.color} via-transparent to-transparent opacity-85 group-hover:opacity-95 transition-opacity`}
              />
              <div className="absolute inset-x-0 bottom-0 p-3.5 text-white">
                <h3 className="font-bold text-sm leading-tight font-['Outfit']">{cat.title}</h3>
                <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">{cat.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. DUAL SEASONAL PROMOTIONAL HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Summer Banner */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 p-8 sm:p-10 text-slate-950 flex flex-col justify-between min-h-[300px] shadow-lg">
            <div className="relative z-10 space-y-3 max-w-sm">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-amber-950 text-xs font-extrabold uppercase">
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                Summer Breeze 2026
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight font-['Outfit']">
                Light, Airy & Sun-Proof Kids Playwear
              </h3>
              <p className="text-xs sm:text-sm text-slate-900 font-medium leading-relaxed">
                Made from 100% combed cotton that stays cool during Pakistan’s warm summer months.
              </p>
            </div>
            <div className="relative z-10 pt-6">
              <Link
                to="/collections/summer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
              >
                <span>Shop Summer Collection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {/* Background art deco circle */}
            <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-white/15 pointer-events-none" />
          </div>

          {/* Winter Banner */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 p-8 sm:p-10 text-white flex flex-col justify-between min-h-[300px] shadow-lg">
            <div className="relative z-10 space-y-3 max-w-sm">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-extrabold uppercase">
                <Snowflake className="w-3.5 h-3.5 text-sky-400" />
                Winter Warmth Collection
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight font-['Outfit']">
                Plush Teddy Sherpa & Cashmere Knits
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                Keep little explorers cozy with windproof jackets, soft woolen pullovers & thermal layers.
              </p>
            </div>
            <div className="relative z-10 pt-6">
              <Link
                to="/collections/winter"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md"
              >
                <span>Explore Winter Collection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {/* Background art deco circle */}
            <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-sky-500/10 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* 4. PRODUCT SHOWCASE (FEATURED / BEST SELLERS / SUMMER / WINTER) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
              Parents' Favorites
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 font-['Outfit']">
              Featured Kids Wear
            </h2>
          </div>

          {/* Functional Filter Tabs (Buttons conforming to anti-slop guidelines) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl self-start md:self-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'featured'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Featured
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'new'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New Arrivals
            </button>
            <button
              onClick={() => setActiveTab('summer')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'summer'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sun className="w-3 h-3 text-amber-600" />
              <span>Summer Wear</span>
            </button>
            <button
              onClick={() => setActiveTab('winter')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'winter'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Snowflake className="w-3 h-3" />
              <span>Winter Wear</span>
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/5] bg-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-sm transition-all shadow-md hover:shadow-lg"
          >
            <span>Explore All 2026 Collections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 5. WHY SHOP WITH US */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
              The Bachon Ki Dunia Promise
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mt-1 font-['Outfit']">
              Why Parents Across Pakistan Trust Us
            </h2>
            <p className="text-sm text-slate-400 mt-3 font-['Plus_Jakarta_Sans']">
              From newborn crib days to schoolyard adventures, every stitch is designed for pure comfort, safety, and longevity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white font-['Outfit']">
                  100% Skin-Friendly Fabrics
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  We use combed, non-irritating cottons and non-toxic dyes certified safe for baby eczema and sensitive skin.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white font-['Outfit']">
                  Cash on Delivery Nationwide
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Pay at your doorstep anywhere across Pakistan with trusted courier partners (Leopards, Trax, TCS).
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white font-['Outfit']">
                  7-Day Hassle-Free Exchange
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Wrong size? No problem! Swap sizes easily within 7 days through our fast exchange helpline.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white font-['Outfit']">
                  Live WhatsApp Care
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Instant sizing advice, order tracking updates, and personal styling support directly on WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. VERIFIED PARENT REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
            Real Experiences
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 font-['Outfit']">
            Loved By Parents in Pakistan
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((review, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-[#FAF9F6] border border-slate-200/80 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex text-amber-400 mb-3">
                  {[...Array(review.stars)].map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                  "{review.quote}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{review.author}</div>
                  <div className="text-slate-500 text-[11px]">{review.city}</div>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-md">
                  {review.itemBought}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. NEWSLETTER WITH REWARD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-8 sm:p-12 text-slate-950 relative overflow-hidden shadow-xl">
          <div className="max-w-2xl mx-auto text-center space-y-4 relative z-10">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight font-['Outfit']">
              Join the Bachon Ki Dunia Family
            </h2>
            <p className="text-xs sm:text-sm text-slate-900 font-medium">
              Subscribe to get exclusive seasonal previews, secret sales, and instantly receive{' '}
              <strong>10% off</strong> your first order!
            </p>

            {newsletterSubscribed ? (
              <div className="bg-white p-4 rounded-2xl shadow-md inline-flex items-center gap-3 animate-in zoom-in-95">
                <Check className="w-5 h-5 text-emerald-600" />
                <div className="text-left text-xs">
                  <div className="font-bold text-slate-900">Thank you for joining!</div>
                  <div className="text-slate-600">
                    Use code <strong className="font-mono text-amber-600">WELCOME10</strong> at checkout
                  </div>
                </div>
                <button
                  onClick={copyCode}
                  className="ml-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  {copiedCoupon ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCoupon ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 bg-white text-slate-900 px-4 py-3 rounded-xl text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors shadow"
                >
                  Claim 10% Off
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
