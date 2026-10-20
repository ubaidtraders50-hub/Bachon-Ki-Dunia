import React, { Component, type ReactNode } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/common/Logo';
import { AdminLoginPage } from './AdminLoginPage';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class AdminErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Admin view caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-xl mx-auto my-12 bg-white rounded-3xl border border-rose-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Admin Section Error</h2>
          <p className="text-xs text-slate-500">
            {this.state.error?.message || 'An unexpected error occurred in this view.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reload Admin View</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const AdminLayout: React.FC = () => {
  const { admin, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // If verifying token, show quick loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, render login form directly so the page is NEVER blank
  if (!isAuthenticated) {
    return <AdminLoginPage />;
  }

  const navItems = [
    { label: 'Overview', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Products & Variations', path: '/admin/products', icon: <Package className="w-4 h-4" /> },
    { label: 'Categories', path: '/admin/categories', icon: <Layers className="w-4 h-4" /> },
    { label: 'Orders & Shipments', path: '/admin/orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { label: 'Coupons & Settings', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between flex-shrink-0 border-r border-slate-800">
        <div>
          {/* Top Brand Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <Logo variant="white" size="sm" showTagline={false} />
            <span className="text-[10px] font-mono bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-md">
              PORTAL
            </span>
          </div>

          {/* Current Admin User Tag */}
          <div className="px-5 py-3 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="truncate">
              <span className="text-slate-400 block text-[10px]">Logged In As:</span>
              <span className="font-bold text-white truncate">{admin?.email || admin?.username || 'Admin'}</span>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between w-full px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/admin');
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 rounded-xl text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <AdminErrorBoundary>
          <Outlet />
        </AdminErrorBoundary>
      </main>
    </div>
  );
};
