import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Truck, RefreshCw, ShieldCheck, FileText } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const PoliciesPage: React.FC = () => {
  const location = useLocation();
  const { settings } = useStore();

  const isReturns = location.pathname.includes('/returns');
  const [activeTab, setActiveTab] = useState<'shipping' | 'returns' | 'privacy'>(
    isReturns ? 'returns' : 'shipping'
  );

  const freeThreshold = settings?.freeShippingThreshold ?? 3500;
  const shippingFee = settings?.defaultShippingFee ?? 250;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-950 font-['Outfit']">
          Store Policies & Customer Care
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Transparent, family-friendly policies for worry-free shopping across Pakistan.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 justify-center gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('shipping')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'shipping'
              ? 'border-amber-500 text-slate-950'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Shipping & Delivery Policy</span>
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'returns'
              ? 'border-amber-500 text-slate-950'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>7-Day Return & Exchange</span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'privacy'
              ? 'border-amber-500 text-slate-950'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Privacy & Terms</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs text-xs sm:text-sm text-slate-600 leading-relaxed space-y-6">
        {activeTab === 'shipping' && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
              Nationwide Shipping Policy
            </h2>
            <div className="space-y-3">
              <p>
                At <strong>Bachon Ki Dunia</strong>, we understand that parents are eager to receive their
                children's outfits promptly. We dispatch parcels nationwide using reliable courier services
                including <strong>Leopards Courier, Trax Logistics, and TCS</strong>.
              </p>

              <h3 className="font-bold text-slate-900 pt-2">Delivery Timelines:</h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>
                  <strong>Major Urban Centers (Lahore, Karachi, Islamabad, Rawalpindi):</strong> 2 to 3
                  business days.
                </li>
                <li>
                  <strong>Other Pakistani Cities & Regional Towns:</strong> 3 to 5 business days.
                </li>
              </ul>

              <h3 className="font-bold text-slate-900 pt-2">Delivery Charges:</h3>
              <p>
                Standard flat shipping across Pakistan is <strong>Rs. {shippingFee.toLocaleString()}</strong>.
                All orders of <strong>Rs. {freeThreshold.toLocaleString()} or more</strong> receive{' '}
                <strong className="text-emerald-700">100% Free Nationwide Delivery</strong>!
              </p>

              <h3 className="font-bold text-slate-900 pt-2">Cash on Delivery (COD) Procedure:</h3>
              <p>
                Please ensure an exact cash amount is ready at your address when the delivery rider
                calls. Our couriers do not hand over parcels without collecting the COD invoice value.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
              7-Day Hassle-Free Exchange Policy
            </h2>
            <div className="space-y-3">
              <p>
                Kids grow rapidly, and sizes can sometimes vary. We want you to be completely delighted
                with every piece. We happily provide an easy size exchange within{' '}
                <strong>7 days of delivery</strong>.
              </p>

              <h3 className="font-bold text-slate-900 pt-2">Exchange Conditions:</h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>Items must be unused, unwashed, and in original condition with brand tags attached.</li>
                <li>Proof of order (Order ID BKD-xxxx) must be provided.</li>
              </ul>

              <h3 className="font-bold text-slate-900 pt-2">Simple 3-Step Exchange Process:</h3>
              <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
                <li>
                  WhatsApp our customer care team (+923136180608) with your Order ID and photo of the item.
                </li>
                <li>State the preferred replacement size or color.</li>
                <li>
                  Our courier will arrange a reverse pickup or you may dispatch it to our Lahore warehouse, and
                  we will ship the replacement outfit immediately upon verification.
                </li>
              </ol>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
              Privacy Policy & Terms of Service
            </h2>
            <div className="space-y-3">
              <p>
                Bachon Ki Dunia respects the privacy of Pakistani families. We collect only the essential
                information (name, delivery address, WhatsApp/mobile number, email) required to fulfill
                your orders safely and contact you regarding shipment status.
              </p>
              <p>
                We never sell, rent, or lease private customer records to third-party telemarketers or advertisers.
              </p>
              <h3 className="font-bold text-slate-900 pt-2">Pricing & Availability:</h3>
              <p>
                All prices are stated in Pakistani Rupees (PKR / Rs.) and include all applicable taxes.
                While we strive for 100% accurate stock records, in the rare event of simultaneous ordering,
                our team will notify you immediately.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
