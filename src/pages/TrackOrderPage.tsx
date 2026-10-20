import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface TrackedOrder {
  id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  courierName?: string;
  trackingNumber?: string;
  total: number;
  itemCount: number;
  city: string;
  items: Array<{
    productName: string;
    colorName: string;
    size: string;
    quantity: number;
    imageUrl: string;
  }>;
}

export const TrackOrderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { settings } = useStore();

  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  const performLookup = async (idToSearch: string) => {
    if (!idToSearch.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const url = `/api/orders/track?orderId=${encodeURIComponent(idToSearch.trim())}${
        phoneOrEmail.trim() ? `&query=${encodeURIComponent(phoneOrEmail.trim())}` : ''
      }`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Could not find order. Please verify your Order ID.');
      }

      setTrackedOrder(data);
    } catch (err: any) {
      setError(err.message || 'Tracking lookup failed');
      setTrackedOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialId = searchParams.get('orderId');
    if (initialId) {
      setOrderId(initialId);
      performLookup(initialId);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(orderId);
  };

  // Steps pipeline definition
  const steps = [
    { key: 'pending', label: 'Order Placed', desc: 'Received & Queued' },
    { key: 'confirmed', label: 'Confirmed', desc: 'Verified by Staff' },
    { key: 'processing', label: 'Packed', desc: 'Quality Inspected' },
    { key: 'shipped', label: 'Dispatched', desc: 'With Courier Rider' },
    { key: 'delivered', label: 'Delivered', desc: 'Received & Paid' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const currentStepIdx = trackedOrder ? getStepIndex(trackedOrder.status) : 0;
  const isCancelled = trackedOrder?.status === 'cancelled';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider">
          <Truck className="w-3.5 h-3.5 text-amber-600" />
          <span>Real-time Parcel Tracking</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-['Outfit']">
          Track Your Child's Wardrobe
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-['Plus_Jakarta_Sans']">
          Enter your Order Number (e.g. <strong>BKD-2026-8941</strong>) to check the live status of your shipment across Pakistan.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Order ID <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. BKD-2026-8941"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                  className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 pl-9 pr-3 py-2.5 rounded-xl text-xs uppercase font-mono focus:outline-none focus:border-amber-400"
                />
                <Package className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Phone or Email (Optional Verification)
              </label>
              <input
                type="text"
                placeholder="0313 6180608 or email@domain.com"
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              Check your order confirmation SMS or receipt for the BKD ID.
            </span>
            <button
              type="submit"
              disabled={loading || !orderId.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? 'Searching...' : 'Track Package'}</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Tracking Result View */}
      {trackedOrder && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-8 shadow-sm animate-in fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="text-xs text-slate-500">Order Number:</div>
              <div className="text-2xl font-black text-slate-950 font-mono tracking-tight">
                {trackedOrder.id}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Destination: <strong className="text-slate-800">{trackedOrder.city}</strong> · Total:{' '}
                <strong className="text-slate-800 font-mono">
                  Rs. {trackedOrder.total.toLocaleString()}
                </strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isCancelled ? (
                <span className="px-3.5 py-1.5 rounded-xl bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider">
                  Order Cancelled
                </span>
              ) : (
                <span className="px-3.5 py-1.5 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
                  Status: {trackedOrder.status}
                </span>
              )}
            </div>
          </div>

          {/* Courier Details if Shipped */}
          {trackedOrder.courierName && (
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-sky-950">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sky-900">
                    Handed to {trackedOrder.courierName}
                  </div>
                  <div className="text-sky-700">
                    Tracking Number:{' '}
                    <strong className="font-mono">{trackedOrder.trackingNumber || 'Available shortly'}</strong>
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-sky-700">Expected Delivery: 1-2 days</span>
            </div>
          )}

          {/* Stepper Timeline */}
          {!isCancelled ? (
            <div className="py-4">
              <div className="relative">
                {/* Connecting track line */}
                <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-slate-100 -z-0">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
                  />
                </div>

                {/* Steps points */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                  {steps.map((s, idx) => {
                    const isDone = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    return (
                      <div
                        key={s.key}
                        className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                            isDone
                              ? 'bg-amber-500 text-slate-950 shadow-md ring-4 ring-amber-100'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                        </div>
                        <div>
                          <div
                            className={`text-xs font-bold ${
                              isCurrent
                                ? 'text-amber-700'
                                : isDone
                                ? 'text-slate-900'
                                : 'text-slate-400'
                            }`}
                          >
                            {s.label}
                          </div>
                          <div className="text-[10px] text-slate-500">{s.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              This order has been cancelled. If this was done by mistake, please contact our WhatsApp
              helpline to reactivate your shipment.
            </div>
          )}

          {/* Items Preview */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Package Contents ({trackedOrder.itemCount} Items)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trackedOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF9F6] border border-slate-200/60"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-slate-900 truncate">{item.productName}</div>
                    <div className="text-slate-500 text-[11px]">
                      {item.colorName} · {item.size} · Qty: {item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Support CTA */}
          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Need courier contact details or address change?</span>
            </div>
            <a
              href={`https://wa.me/${(settings?.whatsapp || '923136180608').replace(
                /[^0-9]/g,
                ''
              )}?text=Assalam-o-Alaikum,%20inquiring%20about%20Order%20${trackedOrder.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors shadow-xs"
            >
              Ask on WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
