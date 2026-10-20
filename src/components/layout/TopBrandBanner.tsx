import React from 'react';
import { Phone, MessageCircle, Truck, Sparkles, Mail, ShieldCheck, Heart } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Link } from 'react-router-dom';

export const TopBrandBanner: React.FC = () => {
  const { settings } = useStore();
  const phone = settings?.phone || '+923136180608';
  const whatsapp = settings?.adminAlertWhatsapp || settings?.whatsapp || '03244422742';
  const email = settings?.email || 'bachonkidunia50@gmail.com';
  
  // Format clean WhatsApp number for direct link
  let cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');
  if (cleanWhatsapp.startsWith('0092')) {
    cleanWhatsapp = cleanWhatsapp.slice(2);
  } else if (cleanWhatsapp.startsWith('0')) {
    cleanWhatsapp = '92' + cleanWhatsapp.slice(1);
  } else if (!cleanWhatsapp.startsWith('92') && cleanWhatsapp.length === 10) {
    cleanWhatsapp = '92' + cleanWhatsapp;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 border-b-2 border-amber-600/40 shadow-md relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:20px_20px]" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          
          {/* Main Brand Banner: Official Logo Emblem + Typography */}
          <Link to="/" className="flex items-center gap-3 sm:gap-4 group select-none">
            {/* Prominent Circular Emblem Logo */}
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-22 lg:h-22 rounded-full overflow-hidden bg-white border-3 border-slate-950 shadow-xl group-hover:scale-105 transition-all duration-300 p-0.5 flex-shrink-0 ring-4 ring-amber-300/60">
                <img
                  src="/logo.jpg"
                  alt="Bachon Ki Dunia Official Brand Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 bg-slate-950 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-400 font-mono shadow-md">
                ★ 100% ORIGINAL
              </span>
            </div>

            {/* Brand Title & Tagline Banner */}
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight font-['Outfit'] drop-shadow-xs">
                  Bachon <span className="text-white drop-shadow-sm">Ki</span> Dunia
                </span>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-slate-950 text-amber-300 px-2.5 py-0.5 rounded-full font-mono shadow-xs">
                  Kids Clothing Store
                </span>
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-wide font-['Plus_Jakarta_Sans'] flex items-center gap-1.5 mt-0.5">
                <span className="text-amber-950 font-black">“Little Clothes, Big Smiles!”</span>
                <span className="text-[11px] font-medium text-slate-800 hidden lg:inline">
                  · Premium Quality Summer & Winter Kids Fashion
                </span>
              </p>
            </div>
          </Link>

          {/* Center Callout: Trust, Shipping & Delivery Badges */}
          <div className="hidden xl:flex items-center gap-3 text-xs font-bold text-slate-900 bg-white/50 backdrop-blur-xs px-4 py-2 rounded-2xl border border-amber-600/30 shadow-xs">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-slate-950 flex-shrink-0" />
              <span>Free Delivery on Rs. 3,500+</span>
            </div>
            <span className="text-amber-800 font-black">•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-800 flex-shrink-0" />
              <span>Cash on Delivery (COD) across Pakistan 🇵🇰</span>
            </div>
          </div>

          {/* Right Direct Action Helpline: WhatsApp & Email */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Assalam-o-Alaikum Bachon Ki Dunia! I want to inquire about kids clothing.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-extrabold transition-all shadow-md hover:shadow-lg hover:scale-102 group"
              title="Order on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/20 group-hover:rotate-12 transition-transform" />
              <span>WhatsApp: {whatsapp}</span>
            </a>

            <a
              href={`mailto:${email}`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-white/70 hover:bg-white text-slate-950 rounded-xl text-xs font-bold border border-amber-600/30 transition-colors shadow-2xs"
              title="Email Customer Support"
            >
              <Mail className="w-3.5 h-3.5 text-slate-800" />
              <span className="text-[11px] font-mono">{email}</span>
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};
