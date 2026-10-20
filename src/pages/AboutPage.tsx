import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Sparkles, Truck, Sun, Snowflake, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-2xl mx-auto flex flex-col items-center">
        <img
          src="/logo.jpg"
          alt="Bachon Ki Dunia Logo"
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-amber-300 shadow-lg object-cover bg-white p-1"
        />
        <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
          Our Brand Story
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-950 font-['Outfit'] tracking-tight">
          Crafted for Childhood Wonder
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-['Plus_Jakarta_Sans']">
          Welcome to <strong>Bachon Ki Dunia</strong> — Pakistan’s premier homegrown childrenswear
          label where breathable natural comfort meets joyful everyday elegance.
        </p>
      </div>

      {/* Philosophy Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Outfit']">
            Little Clothes, Big Smiles!
          </h2>
          <p>
            As parents ourselves, we observed a persistent challenge in Pakistan's children's fashion:
            outfits were either synthetic and stifling for our hot summers, or stiff and uncomfortable
            during cold winters.
          </p>
          <p>
            We founded Bachon Ki Dunia in Lahore with a clear promise: create kids' clothing with the
            softest combed cottons, safe non-toxic dyes, durable stitching, and cheerful playful
            designs that withstand active playtime, endless washing, and sibling hand-me-downs.
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs transition-colors shadow-sm"
            >
              <span>Explore Collections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-md">
          <img
            src="https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80"
            alt="Bachon Ki Dunia kids playwear"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 4 Pillars */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900 font-['Outfit'] text-center">
          What Sets Bachon Ki Dunia Apart
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#FAF9F6] border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Sun className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Gentle & Breathable</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              We exclusively use 100% combed cotton and soft fleece that never causes sweat rashes or skin itching.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FAF9F6] border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Snowflake className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Seasonal Perfection</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tailored specifically for Pakistan's climate — light breathable fabrics for summer and plush cozy layers for winter.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FAF9F6] border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Nationwide Reliability</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Serving families in Karachi, Lahore, Islamabad, and over 150 cities with Cash on Delivery and easy 7-day exchanges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
