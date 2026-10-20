import React from 'react';
import { Sparkles, Truck, Tag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Link } from 'react-router-dom';

export const AnnouncementBar: React.FC = () => {
  const { settings } = useStore();

  if (settings && !settings.isAnnouncementActive) {
    return null;
  }

  const defaultMsg =
    '✨ Summer & Winter Collections 2026 are LIVE! | Free Delivery across Pakistan on orders above Rs. 3,500 | Use Code WELCOME10 for 10% OFF';

  return (
    <div className="bg-[#0F1E36] text-white py-2 px-4 text-xs font-medium border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left micro badge / perk */}
        <div className="hidden md:flex items-center gap-2 text-amber-400">
          <Truck className="w-3.5 h-3.5" />
          <span>Nationwide Cash on Delivery (COD)</span>
        </div>

        {/* Center rotating announcement message */}
        <div className="flex-1 text-center truncate">
          <span>{settings?.announcementText || defaultMsg}</span>
        </div>

        {/* Right quick perks / link */}
        <div className="hidden lg:flex items-center gap-4 text-slate-300">
          <Link
            to="/track-order"
            className="hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            <span>Track Order</span>
          </Link>
          <span className="text-slate-600">|</span>
          <span className="text-amber-300 font-semibold flex items-center gap-1">
            <Tag className="w-3 h-3" />
            <span>Code: WELCOME10</span>
          </span>
        </div>
      </div>
    </div>
  );
};
