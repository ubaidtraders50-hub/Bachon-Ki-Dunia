import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Tag,
  Trash2,
  Plus,
  Truck,
  Settings,
  Store,
  Phone,
  CreditCard,
  Wallet,
  Bell,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import type { Coupon, StoreSettings } from '../../types';

export const AdminSettingsPage: React.FC = () => {
  const { getAuthHeaders } = useAuth();
  const { settings, refreshSettings } = useStore();

  const [formData, setFormData] = useState<Partial<StoreSettings>>({});
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // New Coupon form state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState(10);
  const [newCouponMin, setNewCouponMin] = useState(1500);
  const [addingCoupon, setAddingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error('Failed to load coupons', err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSaved(false);
    setSettingsError(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update settings');
      }

      await refreshSettings();
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err: any) {
      setSettingsError(err.message || 'Error updating settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setAddingCoupon(true);

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          code: newCouponCode.trim().toUpperCase(),
          discountType: newCouponType,
          discountValue: Number(newCouponValue),
          minOrderValue: Number(newCouponMin),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add coupon');
      }

      setNewCouponCode('');
      fetchCoupons();
    } catch (err: any) {
      setCouponError(err.message || 'Error adding coupon');
    } finally {
      setAddingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    try {
      const res = await fetch(`/api/coupons/${code}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        fetchCoupons();
      }
    } catch (err) {
      console.error('Failed to delete coupon', err);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
          Store Configuration & Discounts
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage brand details, WhatsApp hotline, shipping thresholds, and promotional coupons.
        </p>
      </div>

      {/* Store Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-slate-900 text-base font-['Outfit']">
              Brand & Contact Settings
            </h2>
          </div>
          {settingsSaved && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Settings Saved Successfully!</span>
            </span>
          )}
        </div>

        {settingsError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{settingsError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Store Name</label>
            <input
              type="text"
              value={formData.storeName || ''}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Tagline</label>
            <input
              type="text"
              value={formData.tagline || ''}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">WhatsApp Hotline (+92 format)</label>
            <input
              type="text"
              value={formData.whatsapp || ''}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Customer Support Phone</label>
            <input
              type="text"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-800 mb-1">Store Address</label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Shipping & Delivery Settings */}
        <div className="pt-4 border-t border-slate-100 space-y-4 text-xs">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-sm">
              Shipping & Nationwide Rates
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Standard Shipping Fee (PKR)
              </label>
              <input
                type="number"
                value={formData.defaultShippingFee ?? 250}
                onChange={(e) => setFormData({ ...formData, defaultShippingFee: Number(e.target.value) })}
                className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Free Shipping Threshold (PKR)
              </label>
              <input
                type="number"
                value={formData.freeShippingThreshold ?? 3500}
                onChange={(e) => setFormData({ ...formData, freeShippingThreshold: Number(e.target.value) })}
                className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Carts at or above this amount automatically receive 100% free delivery.
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods & Bank / JazzCash Account Configuration */}
        <div className="pt-4 border-t border-slate-100 space-y-4 text-xs">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-sm">
              Payment Methods & Bank / JazzCash Accounts
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 font-bold cursor-pointer text-slate-900">
              <input
                type="checkbox"
                checked={formData.enableCod ?? true}
                onChange={(e) => setFormData({ ...formData, enableCod: e.target.checked })}
                className="w-4 h-4 text-amber-500 rounded"
              />
              <span>Enable Cash on Delivery (COD)</span>
            </label>

            <label className="flex items-center gap-2 font-bold cursor-pointer text-slate-900">
              <input
                type="checkbox"
                checked={formData.enableBankTransfer ?? true}
                onChange={(e) => setFormData({ ...formData, enableBankTransfer: e.target.checked })}
                className="w-4 h-4 text-amber-500 rounded"
              />
              <span>Enable Direct Transfer / JazzCash / EasyPaisa</span>
            </label>
          </div>

          {/* Bank / JazzCash details inputs */}
          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200/90 space-y-3 mt-2">
            <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-amber-600" />
              <span>Official Account Details Shown to Customers at Checkout</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                  Payment Service / Bank Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. JazzCash"
                  value={formData.bankDetails?.bankName || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankDetails: {
                        ...(formData.bankDetails || {
                          accountTitle: '',
                          accountNumber: '',
                          iban: '',
                          instructions: '',
                          bankName: '',
                        }),
                        bankName: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                  Account Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Salman Siddiqui"
                  value={formData.bankDetails?.accountTitle || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankDetails: {
                        ...(formData.bankDetails || {
                          bankName: 'JazzCash',
                          accountNumber: '',
                          iban: '',
                          instructions: '',
                          accountTitle: '',
                        }),
                        accountTitle: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                  Account / Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 03244422742"
                  value={formData.bankDetails?.accountNumber || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankDetails: {
                        ...(formData.bankDetails || {
                          bankName: 'JazzCash',
                          accountTitle: 'Salman Siddiqui',
                          iban: '',
                          instructions: '',
                          accountNumber: '',
                        }),
                        accountNumber: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-400 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                IBAN / Additional Reference (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. PK00JCAS03244422742"
                value={formData.bankDetails?.iban || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bankDetails: {
                      ...(formData.bankDetails || {
                        bankName: 'JazzCash',
                        accountTitle: 'Salman Siddiqui',
                        accountNumber: '03244422742',
                        instructions: '',
                        iban: '',
                      }),
                      iban: e.target.value,
                    },
                  })
                }
                className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                Payment Instructions Shown to Customers
              </label>
              <textarea
                rows={2}
                placeholder="Instructions on sending screenshot and order ID..."
                value={formData.bankDetails?.instructions || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bankDetails: {
                      ...(formData.bankDetails || {
                        bankName: 'JazzCash',
                        accountTitle: 'Salman Siddiqui',
                        accountNumber: '03244422742',
                        iban: '',
                        instructions: '',
                      }),
                      instructions: e.target.value,
                    },
                  })
                }
                className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Admin Instant Order Alerts (WhatsApp & Email) */}
        <div className="pt-4 border-t border-slate-100 space-y-4 text-xs">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Admin Instant Order Alerts (WhatsApp & Email)
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Active
            </span>
          </div>

          <p className="text-slate-500 text-[11px]">
            Every time a customer places or confirms an order, an instant alert with full details (customer name, items, delivery address, total amount, payment method) will be prepared and sent to these contact channels.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Admin Alert WhatsApp Number</span>
              </label>
              <input
                type="text"
                placeholder="03244422742"
                value={formData.adminAlertWhatsapp ?? '03244422742'}
                onChange={(e) => setFormData({ ...formData, adminAlertWhatsapp: e.target.value })}
                className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400 font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Primary WhatsApp for order notifications (Salman Siddiqui: 03244422742).
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-700" />
                <span>Admin Alert Notification Email</span>
              </label>
              <input
                type="email"
                placeholder="bachonkidunia50@gmail.com"
                value={formData.adminAlertEmail ?? 'bachonkidunia50@gmail.com'}
                onChange={(e) => setFormData({ ...formData, adminAlertEmail: e.target.value })}
                className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400 font-medium"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Direct inbox for order receipts and confirmation alerts.
              </span>
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
          <label className="flex items-center gap-2 font-bold cursor-pointer text-slate-900">
            <input
              type="checkbox"
              checked={formData.isAnnouncementActive ?? true}
              onChange={(e) => setFormData({ ...formData, isAnnouncementActive: e.target.checked })}
              className="w-4 h-4 text-amber-500 rounded"
            />
            <span>Show Announcement Bar on Website Header</span>
          </label>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Announcement Message Text</label>
            <input
              type="text"
              value={formData.announcementText || ''}
              onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
              className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={savingSettings}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{savingSettings ? 'Saving Settings...' : 'Save Store Settings'}</span>
          </button>
        </div>
      </form>

      {/* Coupons Management */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-slate-900 text-base font-['Outfit']">
              Promotional Coupons & Discount Codes
            </h2>
          </div>
        </div>

        {couponError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{couponError}</span>
          </div>
        )}

        {/* Add Coupon Form */}
        <form onSubmit={handleAddCoupon} className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200/80 space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Create New Promotional Coupon
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Coupon Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. EIDKIDS20"
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                className="w-full bg-white border border-slate-200 uppercase font-mono px-3 py-2 rounded-xl focus:outline-none focus:border-amber-400 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Discount Type</label>
              <select
                value={newCouponType}
                onChange={(e) => setNewCouponType(e.target.value as any)}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-400"
              >
                <option value="percentage">Percentage Off (%)</option>
                <option value="fixed">Fixed Amount Off (PKR)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Discount Value *</label>
              <input
                type="number"
                required
                min="1"
                placeholder={newCouponType === 'percentage' ? 'e.g. 15 for 15%' : 'e.g. 500 for Rs. 500'}
                value={newCouponValue}
                onChange={(e) => setNewCouponValue(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-400 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Min Order Value (PKR)</label>
              <input
                type="number"
                min="0"
                value={newCouponMin}
                onChange={(e) => setNewCouponMin(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={addingCoupon || !newCouponCode.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{addingCoupon ? 'Adding...' : 'Add Coupon Code'}</span>
            </button>
          </div>
        </form>

        {/* Existing Coupons Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF9F6] text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Discount</th>
                <th className="py-2.5 px-3">Min Order</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map((c) => (
                <tr key={c.code} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{c.code}</td>
                  <td className="py-2.5 px-3 font-semibold text-amber-700">
                    {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `Rs. ${c.discountValue.toLocaleString()} OFF`}
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    Rs. {c.minOrderValue.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Active
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleDeleteCoupon(c.code)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete coupon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
