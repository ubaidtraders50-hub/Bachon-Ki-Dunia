import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  X,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import type { Order } from '../../types';

export const AdminOrdersPage: React.FC = () => {
  const { getAuthHeaders } = useAuth();
  const { settings } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [courierNameInput, setCourierNameInput] = useState('');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter !== 'all') query.set('status', statusFilter);
      if (searchQuery.trim()) query.set('search', searchQuery.trim());

      const res = await fetch(`/api/orders?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setCourierNameInput(order.courierName || 'Trax Logistics');
    setTrackingNumberInput(order.trackingNumber || '');
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      const payload: any = { status: newStatus };
      if (newStatus === 'shipped') {
        payload.courierName = courierNameInput;
        payload.trackingNumber = trackingNumberInput || `TRX-${Math.floor(10000000 + Math.random() * 90000000)}`;
      }
      if (newStatus === 'delivered') {
        payload.paymentStatus = 'paid';
      }

      const res = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedOrder(updated);
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statuses = [
    { label: 'All Orders', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
          Orders & Shipment Dispatch
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review customer address info, verify stock, and manage Pakistan courier tracking.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                statusFilter === s.value
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 text-xs">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by Order ID (BKD-...), customer name, phone or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 pl-8 pr-3 py-2 rounded-xl focus:outline-none focus:border-amber-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF9F6] text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Items Ordered</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No orders found matching this criteria.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 font-mono text-sm">{o.id}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(o.createdAt).toLocaleDateString()} {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{o.customer?.fullName || 'Customer'}</div>
                      <div className="text-[11px] text-slate-500">{o.customer?.city || 'Pakistan'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{o.customer?.phone || ''}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">
                        {(o.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0)} Items
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-xs">
                        {(o.items || []).map((i) => `${i.productName} (${i.colorName || ''}/${i.size || ''})`).join(', ')}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          o.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.status === 'shipped'
                            ? 'bg-sky-100 text-sky-800'
                            : o.status === 'delivered'
                            ? 'bg-emerald-600 text-white'
                            : o.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="capitalize font-semibold text-slate-800">
                        {o.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}
                      </span>
                      <div className="text-[10px] text-slate-400 capitalize">
                        Status: {o.paymentStatus}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      Rs. {(o.total || 0).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openOrderModal(o)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] text-slate-400 font-mono">Order Management</span>
                <h2 className="font-extrabold text-slate-950 text-xl font-mono">
                  {selectedOrder.id}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Change Selector */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Update Order Status:</span>
                <span className="capitalize font-bold text-amber-800 font-mono">
                  Current: {selectedOrder.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(
                  (st) => (
                    <button
                      key={st}
                      disabled={updatingStatus || selectedOrder.status === st}
                      onClick={() => handleUpdateStatus(st)}
                      className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-colors ${
                        selectedOrder.status === st
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      Mark {st}
                    </button>
                  )
                )}
              </div>

              {/* Courier info inputs if shipping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                    Courier Partner:
                  </label>
                  <select
                    value={courierNameInput}
                    onChange={(e) => setCourierNameInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg text-xs"
                  >
                    <option value="Trax Logistics">Trax Logistics</option>
                    <option value="Leopards Courier">Leopards Courier</option>
                    <option value="TCS Express">TCS Express</option>
                    <option value="M&P Courier">M&P Courier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                    Tracking Number:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TRX-94817263"
                    value={trackingNumberInput}
                    onChange={(e) => setTrackingNumberInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700 p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200/60">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 block text-xs">Customer Contact:</span>
                <div className="font-semibold">{selectedOrder.customer.fullName}</div>
                <div className="flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{selectedOrder.customer.phone}</span>
                </div>
                {selectedOrder.customer.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{selectedOrder.customer.email}</span>
                  </div>
                )}
                <div className="pt-2 flex flex-wrap gap-2">
                  <a
                    href={`https://wa.me/${selectedOrder.customer.phone.replace(
                      /[^0-9]/g,
                      ''
                    )}?text=Assalam-o-Alaikum%20${encodeURIComponent(
                      selectedOrder.customer.fullName
                    )},%20this%20is%20Bachon%20Ki%20Dunia%20regarding%20Order%20${selectedOrder.id}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px]"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Customer</span>
                  </a>

                  {/* WhatsApp Alert to Admin */}
                  <a
                    href={`https://wa.me/${(settings?.adminAlertWhatsapp || '03244422742').replace(/[^0-9]/g, '').startsWith('0') ? '92' + (settings?.adminAlertWhatsapp || '03244422742').replace(/[^0-9]/g, '').slice(1) : (settings?.adminAlertWhatsapp || '923244422742').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `🔔 *ORDER ALERT - BACHON KI DUNIA*\nOrder #${selectedOrder.id} (${selectedOrder.customer.fullName})\nPhone: ${selectedOrder.customer.phone}\nAddress: ${selectedOrder.customer.address}, ${selectedOrder.customer.city}\nTotal: Rs. ${selectedOrder.total.toLocaleString()}\nMethod: ${selectedOrder.paymentMethod}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-[11px]"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Send WhatsApp Alert (Admin)</span>
                  </a>

                  {/* Email Alert to Admin */}
                  <a
                    href={`mailto:${settings?.adminAlertEmail || 'bachonkidunia50@gmail.com'}?subject=${encodeURIComponent(
                      `Order Alert: #${selectedOrder.id} - ${selectedOrder.customer.fullName}`
                    )}&body=${encodeURIComponent(
                      `Order ID: #${selectedOrder.id}\nCustomer: ${selectedOrder.customer.fullName}\nPhone: ${selectedOrder.customer.phone}\nAddress: ${selectedOrder.customer.address}, ${selectedOrder.customer.city}\nTotal: Rs. ${selectedOrder.total}\nPayment: ${selectedOrder.paymentMethod}`
                    )}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-[11px]"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Email Alert</span>
                  </a>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-900 block text-xs">Delivery Address:</span>
                <div className="text-slate-800">{selectedOrder.customer.address}</div>
                <div className="font-semibold text-slate-900">
                  {selectedOrder.customer.city}, {selectedOrder.customer.province}
                </div>
                {selectedOrder.customer.orderNotes && (
                  <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg mt-2">
                    <strong>Note:</strong> {selectedOrder.customer.orderNotes}
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Ordered Outfits
              </h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">{item.productName}</div>
                        <div className="text-slate-500 text-[11px]">
                          Color: <strong>{item.colorName}</strong> · Size: <strong>{item.size}</strong> · SKU: {item.sku}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900">
                        Rs. {item.subtotal.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.quantity} × Rs. {item.unitPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3 max-w-xs ml-auto">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono">Rs. {selectedOrder.subtotal.toLocaleString()}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount ({selectedOrder.couponCode || 'Coupon'}):</span>
                  <span className="font-mono">-Rs. {selectedOrder.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span className="font-mono">
                  {selectedOrder.shippingFee === 0 ? 'FREE' : `Rs. ${selectedOrder.shippingFee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-100">
                <span>Total:</span>
                <span className="font-mono text-amber-600">Rs. {selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
