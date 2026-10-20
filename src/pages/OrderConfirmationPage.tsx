import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Printer,
  MessageCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
  Calendar,
  CreditCard,
  Mail,
  Copy,
  Check,
  Bell,
  Send,
} from 'lucide-react';
import type { Order } from '../types';
import { useStore } from '../context/StoreContext';

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const { settings } = useStore();

  const [order, setOrder] = useState<Order | null>(
    (location.state as any)?.order || null
  );
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!order && orderId) {
      const fetchOrder = async () => {
        try {
          const res = await fetch(`/api/orders/${orderId}`);
          if (!res.ok) throw new Error('Order not found');
          const data = await res.json();
          setOrder(data);
        } catch (err: any) {
          setError(err.message || 'Could not load order details');
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [orderId, order]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-700">Loading order receipt...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Order Record Not Found</h2>
        <p className="text-xs text-slate-500">
          We could not locate this order ID. If you just placed an order, please check your SMS or email.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          <span>Return Home</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Admin Alert Configuration
  const rawAdminPhone = settings?.adminAlertWhatsapp || settings?.whatsapp || '03244422742';
  let cleanAdminPhone = rawAdminPhone.replace(/[^0-9]/g, '');
  if (cleanAdminPhone.startsWith('0092')) {
    cleanAdminPhone = cleanAdminPhone.slice(2);
  } else if (cleanAdminPhone.startsWith('0')) {
    cleanAdminPhone = '92' + cleanAdminPhone.slice(1);
  } else if (!cleanAdminPhone.startsWith('92') && cleanAdminPhone.length === 10) {
    cleanAdminPhone = '92' + cleanAdminPhone;
  }
  const adminEmail = settings?.adminAlertEmail || settings?.email || 'bachonkidunia50@gmail.com';

  const itemsSummary = order.items
    .map(
      (item) =>
        `• ${item.quantity}x ${item.productName} (${item.colorName}, ${item.size}) - Rs. ${item.subtotal.toLocaleString()}`
    )
    .join('\n');

  const orderSummaryText =
    `🔔 *NEW ORDER CONFIRMED - BACHON KI DUNIA* 🔔\n\n` +
    `📦 *Order ID:* #${order.id}\n` +
    `👤 *Customer Name:* ${order.customer.fullName}\n` +
    `📞 *Customer Phone:* ${order.customer.phone}\n` +
    `📍 *Delivery Address:* ${order.customer.address}, ${order.customer.city}\n\n` +
    `🛍️ *Items Ordered:*\n${itemsSummary}\n\n` +
    `💰 *Subtotal:* Rs. ${order.subtotal.toLocaleString()}\n` +
    `🚚 *Shipping Fee:* ${order.shippingFee === 0 ? 'FREE' : `Rs. ${order.shippingFee}`}\n` +
    (order.discount > 0 ? `🏷️ *Discount:* -Rs. ${order.discount.toLocaleString()}\n` : '') +
    `💵 *TOTAL PAYABLE:* Rs. ${order.total.toLocaleString()}\n` +
    `💳 *Payment Method:* ${
      order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'JazzCash / Direct Bank Transfer'
    }\n` +
    (order.customer.orderNotes ? `📝 *Customer Notes:* ${order.customer.orderNotes}\n` : '') +
    `\n✨ *Bachon Ki Dunia Online Order Notification*`;

  const adminWhatsappUrl = `https://wa.me/${cleanAdminPhone}?text=${encodeURIComponent(
    orderSummaryText
  )}`;
  const adminEmailUrl = `mailto:${adminEmail}?subject=${encodeURIComponent(
    `New Order Confirmed: #${order.id} - ${order.customer.fullName}`
  )}&body=${encodeURIComponent(orderSummaryText)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 print:py-0">
      {/* Success Celebration Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm text-center space-y-4 relative overflow-hidden">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
            Order Successfully Placed
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-950 font-['Outfit']">
            Thank You, {order.customer.fullName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto pt-1 font-['Plus_Jakarta_Sans']">
            Your kid's clothing parcel has been booked. Our team will pack it with love and dispatch it promptly.
          </p>
        </div>

        {/* Order ID Badge */}
        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-[#FAF9F6] border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 font-mono shadow-2xs">
          <span>Order ID:</span>
          <span className="text-amber-600 font-extrabold text-base">#{order.id}</span>
        </div>

        {/* Action Buttons: WhatsApp & Print & Tracking */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3 print:hidden">
          <a
            href={adminWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Confirm Order on WhatsApp</span>
          </a>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <Link
            to={`/track-order?orderId=${order.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            <Truck className="w-4 h-4" />
            <span>Live Order Tracking</span>
          </Link>
        </div>
      </div>

      {/* Admin Instant Notification & Dispatch Alert Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-4 border border-amber-500/30 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 font-bold shadow-md">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg font-['Outfit'] text-white flex items-center gap-2">
                <span>Admin Instant Order Alert & Notification</span>
                <span className="text-[10px] font-mono bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                  READY
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Admin WhatsApp: <strong className="text-amber-400 font-mono">{rawAdminPhone}</strong> · Admin Email: <strong className="text-amber-400 font-mono">{adminEmail}</strong>
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Order notification is ready to be dispatched directly to store management. Click below to trigger the WhatsApp alert or send a confirmation email receipt.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <a
            href={adminWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md"
          >
            <MessageCircle className="w-4 h-4 fill-slate-950/20" />
            <span>Send Alert on WhatsApp</span>
          </a>

          <a
            href={adminEmailUrl}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md"
          >
            <Mail className="w-4 h-4 text-amber-600" />
            <span>Send Order Email</span>
          </a>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(orderSummaryText);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Order Details Copied!' : 'Copy Order Text'}</span>
          </button>
        </div>
      </div>

      {/* Order Details & Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 font-['Outfit'] pb-3 border-b border-slate-100">
          Order Summary & Invoice
        </h2>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-600 pb-4 border-b border-slate-100">
          <div>
            <span className="font-bold text-slate-900 block mb-1">Delivery Address:</span>
            <p className="text-slate-800 font-medium">{order.customer.fullName}</p>
            <p>{order.customer.address}</p>
            <p>
              {order.customer.city}, {order.customer.province}
            </p>
            <p className="font-mono text-slate-800 mt-1">Phone: {order.customer.phone}</p>
          </div>

          <div>
            <span className="font-bold text-slate-900 block mb-1">Payment Method:</span>
            <p className="capitalize font-semibold text-slate-900">
              {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Direct Bank Transfer'}
            </p>
            <p className="text-slate-500 mt-1">
              Payment Status: <strong className="capitalize text-amber-700">{order.paymentStatus}</strong>
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-900 block mb-1">Estimated Delivery:</span>
            <p className="font-semibold text-slate-900">2 - 4 Business Days</p>
            <p className="text-slate-500 mt-1">Nationwide Courier Service</p>
          </div>
        </div>

        {/* JazzCash / Bank Transfer Instructions Box */}
        {order.paymentMethod === 'bank_transfer' && (
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span>JazzCash / Bank Transfer Details:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-amber-200">
              <div>
                <span className="text-slate-500 block text-[10px]">Payment Method:</span>
                <strong className="text-slate-950 font-bold">{settings?.bankDetails.bankName || 'JazzCash'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Account Title:</span>
                <strong className="text-slate-950 font-bold">{settings?.bankDetails.accountTitle || 'Salman Siddiqui'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Account / Mobile Number:</span>
                <strong className="font-mono text-amber-700 font-extrabold text-sm">
                  {settings?.bankDetails.accountNumber || '03244422742'}
                </strong>
              </div>
            </div>
            <p className="text-[11px] text-amber-950">
              {settings?.bankDetails.instructions ||
                'Please transfer via JazzCash to Salman Siddiqui (03244422742) and share payment screenshot on WhatsApp (+923136180608) with your Order ID.'}
            </p>
          </div>
        )}

        {/* Ordered Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF9F6] text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Variation</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Qty</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200/60"
                    />
                    <div>
                      <div className="font-bold text-slate-900">{item.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium">{item.colorName}</span> ·{' '}
                    <span className="font-semibold text-slate-900">{item.size}</span>
                  </td>
                  <td className="py-3 px-4 font-mono">Rs. {item.unitPrice.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono font-bold">{item.quantity}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-950">
                    Rs. {item.subtotal.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculations */}
        <div className="max-w-xs ml-auto space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-mono text-slate-900 font-semibold">
              Rs. {order.subtotal.toLocaleString()}
            </span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Discount ({order.couponCode || 'Promo'}):</span>
              <span className="font-mono">-Rs. {order.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span className="font-mono">
              {order.shippingFee === 0 ? 'FREE' : `Rs. ${order.shippingFee.toLocaleString()}`}
            </span>
          </div>
          <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-100">
            <span>Total Amount:</span>
            <span className="font-mono text-amber-600">Rs. {order.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="text-center print:hidden">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-amber-600"
        >
          <span>← Back to Bachon Ki Dunia Home</span>
        </Link>
      </div>
    </div>
  );
};
