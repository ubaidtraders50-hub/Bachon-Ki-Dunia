import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertTriangle,
  Package,
  Layers,
  ArrowRight,
  Truck,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const { getAuthHeaders } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/dashboard-stats', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded-xl w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time business performance for Bachon Ki Dunia.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/products"
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5" />
            <span>+ Add Product</span>
          </Link>
          <Link
            to="/admin/categories"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>Manage Categories</span>
          </Link>
          <Link
            to="/admin/orders"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>View Orders</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Net Revenue</span>
            <div className="text-2xl font-black text-slate-950 font-mono mt-1">
              Rs. {(stats?.totalRevenue || 0).toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold">Confirmed Orders</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Orders Placed</span>
            <div className="text-2xl font-black text-slate-950 font-mono mt-1">
              {stats?.totalOrders || 0}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {stats?.deliveredOrders || 0} Delivered
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Pending Orders</span>
            <div className="text-2xl font-black text-amber-600 font-mono mt-1">
              {stats?.pendingOrders || 0}
            </div>
            <span className="text-[11px] text-amber-700 font-semibold">Requires Confirmation</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Low Stock Variations</span>
            <div className="text-2xl font-black text-rose-600 font-mono mt-1">
              {stats?.lowStockCount || 0}
            </div>
            <span className="text-[11px] text-rose-600 font-medium">≤ 5 Units Left</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Recent Orders & Low Stock Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-base font-['Outfit']">
              Recent Orders
            </h2>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-amber-600 hover:underline flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF9F6] text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">City</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(stats?.recentOrders || []).map((o: any) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{o.id}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{o.customer?.fullName || 'Customer'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{o.customer?.phone || ''}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{o.customer?.city || 'Pakistan'}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          o.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.status === 'shipped'
                            ? 'bg-sky-100 text-sky-800'
                            : o.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {o.status || 'pending'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      Rs. {(o.total || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts Box */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-base font-['Outfit'] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Low Stock Watch</span>
            </h2>
            <Link
              to="/admin/products"
              className="text-xs font-semibold text-amber-600 hover:underline"
            >
              Restock →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 space-y-2 max-h-80 overflow-y-auto">
            {(stats?.lowStockItems || []).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                All product variations have healthy inventory!
              </div>
            ) : (
              (stats?.lowStockItems || []).map((item: any) => (
                <div key={item.variationId} className="pt-2 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900 truncate max-w-[200px]">
                      {item.productName}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {item.colorName} · {item.size} · SKU: {item.sku}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 font-bold font-mono text-xs">
                      {item.stock} left
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
