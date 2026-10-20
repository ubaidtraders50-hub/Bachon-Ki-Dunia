import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/common/Logo';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCredentialsHelper, setShowCredentialsHelper] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await login(emailOrUsername, password);
    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error || 'Invalid credentials');
      setSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmailOrUsername('admin@bachonkidunia.com');
    setPassword('BachonAdmin2026!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Logo size="md" />
          <h1 className="text-xl font-bold text-slate-950 font-['Outfit'] pt-2">
            Store Owner Portal
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to manage kid's products, variations, inventory & orders
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Username or Email</label>
            <div className="relative">
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="Enter username or email"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-amber-400"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-amber-400"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors shadow-md disabled:opacity-50"
          >
            {submitting ? 'Verifying...' : 'Sign In to Dashboard'}
          </button>
        </form>

        {/* Credentials Helper Toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowCredentialsHelper(!showCredentialsHelper)}
            className="w-full flex items-center justify-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Key className="w-3 h-3 text-slate-400" />
            <span>{showCredentialsHelper ? 'Hide login reference' : 'Need default admin login info?'}</span>
          </button>

          {showCredentialsHelper && (
            <div className="mt-2.5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-950 space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-700" />
                  <span>Default System Login:</span>
                </span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[11px] text-amber-800 underline font-semibold hover:text-amber-950"
                >
                  Insert Info
                </button>
              </div>
              <div className="font-mono text-[11px] text-slate-700 space-y-0.5">
                <div>Email: <span className="font-semibold text-slate-900">admin@bachonkidunia.com</span></div>
                <div>Password: <span className="font-semibold text-slate-900">BachonAdmin2026!</span></div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center pt-2">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-900 font-medium">
            ← Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};
