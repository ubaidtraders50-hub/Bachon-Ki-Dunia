import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle, ShieldCheck, Truck, RefreshCw, Heart } from 'lucide-react';
import { Logo } from '../common/Logo';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const { settings } = useStore();

  const whatsappNumber = settings?.whatsapp || '+923136180608';
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 pt-16 pb-10">
      {/* Top Value Badges Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Nationwide Delivery</div>
              <div className="text-xs text-slate-400">Cash on Delivery across Pakistan</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Gentle & Safe Fabrics</div>
              <div className="text-xs text-slate-400">Hypoallergenic combed cottons</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">7-Day Easy Exchange</div>
              <div className="text-xs text-slate-400">Hassle-free size swaps</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Dedicated Support</div>
              <div className="text-xs text-slate-400">Fast assistance on WhatsApp</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="white" size="md" />
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Bachon Ki Dunia is Pakistan's premier destination for thoughtfully designed,
              ultra-comfortable summer and winter clothing for babies, toddlers, and children.
              Crafted for everyday adventures and joyous childhood smiles.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${cleanPhone}?text=Hi%20Bachon%20Ki%20Dunia%20Team!`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
              <Link
                to="/track-order"
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-4 py-2 rounded-full transition-colors"
              >
                <span>Track Your Order</span>
              </Link>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase font-mono">
              Collections
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/collections/summer" className="hover:text-amber-400 transition-colors">
                  Summer Breeze '26
                </Link>
              </li>
              <li>
                <Link to="/collections/winter" className="hover:text-amber-400 transition-colors">
                  Winter Warmth & Jackets
                </Link>
              </li>
              <li>
                <Link to="/shop?gender=boys" className="hover:text-amber-400 transition-colors">
                  Boys Playwear & Sets
                </Link>
              </li>
              <li>
                <Link to="/shop?gender=girls" className="hover:text-amber-400 transition-colors">
                  Girls Frocks & Dresses
                </Link>
              </li>
              <li>
                <Link to="/shop?category=baby" className="hover:text-amber-400 transition-colors">
                  Baby Essentials (0-24M)
                </Link>
              </li>
              <li>
                <Link to="/shop?category=sweaters" className="hover:text-amber-400 transition-colors">
                  Knitwear & Sweaters
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase font-mono">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/track-order" className="hover:text-amber-400 transition-colors">
                  Track Your Package
                </Link>
              </li>
              <li>
                <Link to="/policies/shipping" className="hover:text-amber-400 transition-colors">
                  Shipping Policy & Charges
                </Link>
              </li>
              <li>
                <Link to="/policies/returns" className="hover:text-amber-400 transition-colors">
                  7-Day Return & Exchange
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-400 transition-colors">
                  Contact & FAQs
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-400 transition-colors">
                  About Our Brand
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-amber-400 transition-colors">
                  Admin Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase font-mono">
              Get in Touch
            </h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{settings?.address || 'Gulberg III, Lahore, Pakistan'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{settings?.phone || '+923136180608'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{settings?.email || 'bachonkidunia50@gmail.com'}</span>
              </div>
              <div className="pt-2 text-xs text-slate-500">
                Nationwide express delivery to Lahore, Karachi, Islamabad, Rawalpindi, Peshawar,
                Faisalabad, Multan, and 150+ Pakistani cities.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-4 border-t border-slate-900 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          © {new Date().getFullYear()} Bachon Ki Dunia. All rights reserved. Little Clothes, Big
          Smiles!
        </div>
        <div className="flex items-center gap-4">
          <Link to="/policies/shipping" className="hover:text-slate-400">
            Terms of Service
          </Link>
          <span>·</span>
          <Link to="/policies/shipping" className="hover:text-slate-400">
            Privacy Policy
          </Link>
          <span>·</span>
          <span>Made with love in Pakistan 🇵🇰</span>
        </div>
      </div>
    </footer>
  );
};
