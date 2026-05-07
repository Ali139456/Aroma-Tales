import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PasswordField } from '../components/PasswordField';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setSessionReady(true);
      setHasSession(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
      setSessionReady(true);
    });
  }, []);

  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center text-dark/45 text-sm">
        Loading…
      </div>
    );
  }

  if (hasSession) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setInfo('');
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured.');
      return;
    }
    setLoading(true);
    const { error: signErr } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signErr) {
      setError(signErr.message);
      return;
    }
    navigate('/admin', { replace: true });
  };

  const handleForgotPassword = async () => {
    setError('');
    setInfo('');
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured.');
      return;
    }
    const addr = email.trim();
    if (!addr) {
      setError('Enter your email above, then tap Forgot password again.');
      return;
    }
    setLoading(true);
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(addr, {
      redirectTo: `${window.location.origin}/admin/login`,
    });
    setLoading(false);
    if (resetErr) {
      setError(resetErr.message);
      return;
    }
    setInfo('Check your email for a reset link. After choosing a new password, sign in here.');
  };

  return (
    <div className="min-h-screen bg-offwhite flex flex-col items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-red-600/20 bg-white mb-6 shadow-sm">
            <Lock className="w-6 h-6 text-red-600" strokeWidth={1.5} aria-hidden />
          </div>
          <p className="text-[10px] uppercase tracking-[0.35em] font-bold text-red-600 mb-3">Staff only</p>
          <h1 className="text-4xl md:text-5xl font-serif text-dark">Admin login</h1>
          <p className="mt-4 text-dark/50 text-sm font-light leading-relaxed">
            Sign in with a Supabase Auth user that has permission to edit catalog tables (see RLS policies).
          </p>
        </div>

        <div className="bg-white p-10 md:p-12 rounded-[2rem] border border-dark/5 shadow-[0_8px_40px_-12px_rgba(18,18,18,0.08)]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <label htmlFor="admin-email" className="text-[10px] uppercase tracking-[0.3em] font-bold text-dark/40 ml-1">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-dark/10 py-3 focus:border-dark transition-colors outline-none text-dark font-light"
                placeholder="admin@yourdomain.com"
              />
            </div>
            <PasswordField
              id="admin-password"
              label="Password"
              labelClassName="text-[10px] uppercase tracking-[0.3em] font-bold text-dark/40 ml-1"
              wrapperClassName="space-y-3"
              inputClassName="w-full bg-transparent border-b border-dark/10 py-3 pr-11 focus:border-dark transition-colors outline-none text-dark font-light"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="text-[11px] uppercase tracking-[0.2em] font-bold text-dark/50 hover:text-dark transition-colors disabled:opacity-40"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-600 font-medium" role="alert">
                {error}
              </p>
            )}
            {info && (
              <p className="text-sm text-dark/65 font-light leading-relaxed" role="status">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-dark text-white text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-red-700 transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in to CRM'}
            </button>
          </form>

          <p className="mt-8 text-[11px] text-dark/35 leading-relaxed">
            Create this user in Supabase → Authentication → Users, then run <code className="text-dark/50">supabase/schema.sql</code>{' '}
            so authenticated accounts can insert/update products.
          </p>

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="text-[11px] uppercase tracking-[0.25em] font-bold text-dark/40 hover:text-dark transition-colors"
            >
              ← Back to site
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
