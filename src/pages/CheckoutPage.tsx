import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  Building,
  CreditCard,
  AlertCircle,
  ArrowRight,
  Check,
  Lock,
  Phone,
  MapPin,
  Tag,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import type { CustomerDetails } from '../types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, shippingFee, discount, total, couponCode, clearCart } = useCart();
  const { settings } = useStore();

  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Lahore',
    province: 'Punjab',
    postalCode: '',
    orderNotes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer' | 'online_card'>('cod');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Popular Pakistani cities list
  const pakistanCities = [
    'Lahore',
    'Karachi',
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Multan',
    'Gujranwala',
    'Peshawar',
    'Quetta',
    'Sialkot',
    'Hyderabad',
    'Bahawalpur',
    'Sargodha',
    'Sukkur',
    'Abbottabad',
    'Gujrat',
    'Sahiwal',
    'Mardan',
    'Kasur',
    'Rahim Yar Khan',
    'Mirpur (AJK)',
    'Muzaffarabad',
    'Other City',
  ];

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Your bag is empty</h2>
        <p className="text-xs text-slate-500">Please add items to your cart before proceeding to checkout.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold"
        >
          <span>Browse Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Pakistan phone validation
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 12) {
      setErrorMessage('Please enter a valid Pakistani mobile number (e.g. 0313 6180608).');
      return;
    }

    if (!customer.fullName.trim() || !customer.address.trim()) {
      setErrorMessage('Please provide your full delivery address and name.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customer,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          productSlug: i.productSlug,
          variationId: i.variationId,
          quantity: i.quantity,
        })),
        paymentMethod,
        couponCode: couponCode || undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      // Order saved in persistent database!
      clearCart();
      navigate(`/order-confirmation/${data.id}`, { state: { order: data } });
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while placing your order.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950 font-['Outfit'] tracking-tight">
          Secure Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete your delivery details for Cash on Delivery across Pakistan.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800 flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery & Payment Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer & Address Form */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h2 className="font-bold text-slate-900 text-base font-['Outfit']">
                Customer & Shipping Information
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fatima Ali / Muhammad Bilal"
                  value={customer.fullName}
                  onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                  className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    WhatsApp / Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="0313 6180608"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-amber-400"
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Our courier rider will call this number prior to delivery.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Email Address <span className="text-slate-400">(Optional for receipt)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Complete Street Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="House / Apartment #, Street #, Sector / Area, Landmark"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={customer.city}
                    onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {pakistanCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Province</label>
                  <select
                    value={customer.province}
                    onChange={(e) => setCustomer({ ...customer, province: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                    <option value="Azad Jammu & Kashmir">Azad Jammu & Kashmir</option>
                    <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Special Delivery Instructions / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ring the bell twice / Call before arrival"
                  value={customer.orderNotes}
                  onChange={(e) => setCustomer({ ...customer, orderNotes: e.target.value })}
                  className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h2 className="font-bold text-slate-900 text-base font-['Outfit']">
                Select Payment Method
              </h2>
            </div>

            <div className="space-y-3">
              {/* Option 1: Cash on Delivery (COD) */}
              <label
                className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 text-amber-500 focus:ring-amber-400"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Most Popular
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Pay with cash directly to the courier rider when your parcel arrives at your doorstep.
                  </p>
                </div>
              </label>

              {/* Option 2: Bank Transfer / JazzCash / EasyPaisa */}
              <label
                className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={paymentMethod === 'bank_transfer'}
                  onChange={() => setPaymentMethod('bank_transfer')}
                  className="mt-1 text-amber-500 focus:ring-amber-400"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      JazzCash / Direct Bank Transfer
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">
                      {settings?.bankDetails.bankName || 'JazzCash'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Instant transfer via JazzCash mobile account or bank and share screenshot on WhatsApp.
                  </p>

                  {paymentMethod === 'bank_transfer' && (
                    <div className="mt-3 p-3.5 bg-white rounded-xl border border-amber-300 text-xs text-slate-800 space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100 font-semibold text-slate-900">
                        <span>Payment Service:</span>
                        <span className="text-amber-700 font-bold">{settings?.bankDetails.bankName || 'JazzCash'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Account Title:</span>
                        <strong className="text-slate-950 font-bold">{settings?.bankDetails.accountTitle || 'Salman Siddiqui'}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">JazzCash Number:</span>
                        <strong className="font-mono text-base font-black text-amber-700 tracking-wide">
                          {settings?.bankDetails.accountNumber || '03244422742'}
                        </strong>
                      </div>
                      {settings?.bankDetails.iban && (
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Reference / IBAN:</span>
                          <span className="font-mono">{settings.bankDetails.iban}</span>
                        </div>
                      )}
                      <div className="pt-2 text-[11px] text-amber-900 bg-amber-50/80 p-2 rounded-lg border border-amber-200/60">
                        {settings?.bankDetails.instructions ||
                          'Please transfer via JazzCash to Salman Siddiqui (03244422742) and share payment screenshot on WhatsApp (+923136180608) with your Order ID.'}
                      </div>
                    </div>
                  )}
                </div>
              </label>

              {/* Option 3: Credit/Debit Card (Disabled / Sandbox status) */}
              <label className="flex items-start gap-3.5 p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/60 opacity-60 cursor-not-allowed">
                <input type="radio" disabled className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 text-sm">
                      Online Visa / Mastercard (Under Maintenance)
                    </span>
                    <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                      Offline
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Under bank sandbox verification. Please choose <strong>Cash on Delivery</strong> or Bank Transfer for instant dispatch.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Placement */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 space-y-6 shadow-xs sticky top-24">
          <h2 className="text-lg font-bold text-slate-900 font-['Outfit'] border-b border-slate-100 pb-3">
            Review Your Items ({items.length})
          </h2>

          {/* Mini item list */}
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto space-y-3">
            {items.map((i) => (
              <div key={i.variationId} className="pt-3 first:pt-0 flex items-center gap-3">
                <img
                  src={i.imageUrl}
                  alt={i.productName}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200/60"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <div className="font-semibold text-slate-900 truncate">{i.productName}</div>
                  <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span>{i.colorName}</span>
                    <span>·</span>
                    <span className="font-medium text-slate-700">{i.size}</span>
                    <span>·</span>
                    <span>Qty: {i.quantity}</span>
                  </div>
                </div>
                <div className="text-xs font-bold text-slate-900 font-mono">
                  Rs. {(i.unitPrice * i.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900 font-mono">
                Rs. {subtotal.toLocaleString()}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Coupon ({couponCode})</span>
                <span className="font-mono">-Rs. {discount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Nationwide Shipping</span>
              <span>
                {shippingFee === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE</span>
                ) : (
                  <span className="font-mono">Rs. {shippingFee.toLocaleString()}</span>
                )}
              </span>
            </div>

            <div className="flex justify-between text-base font-black text-slate-950 pt-3 border-t border-slate-100">
              <span>Total Payable</span>
              <span className="text-amber-600 font-mono">Rs. {total.toLocaleString()}</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>
                {submitting
                  ? 'Verifying Stock & Placing Order...'
                  : paymentMethod === 'cod'
                  ? 'Confirm Order (Cash on Delivery)'
                  : 'Place Order'}
              </span>
            </button>

            <div className="p-3 bg-[#FAF9F6] rounded-2xl border border-slate-200/60 text-center text-[11px] text-slate-500 space-y-1">
              <div className="font-semibold text-slate-800">
                🔒 Safe & Verified Checkout
              </div>
              <div>
                Inventory is reserved immediately upon placement. Never charged until confirmed.
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
