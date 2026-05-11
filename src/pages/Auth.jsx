import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User } from 'lucide-react';
import { appOrigin } from '../lib/appOrigin';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PasswordField } from '../components/PasswordField';

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  /** After sign-up when Supabase requires email confirmation (no session yet). */
  const [signupAwaitingConfirmation, setSignupAwaitingConfirmation] = useState(false);
  const [pendingConfirmEmail, setPendingConfirmEmail] = useState('');

  useEffect(() => {
    setError('');
    setInfo('');
    setSignupAwaitingConfirmation(false);
    setPendingConfirmEmail('');
  }, [mode]);

  /** After email confirmation / magic link, Supabase puts tokens in the URL; pick up session and leave /auth. */
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return undefined;
    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled || !session) return;
      navigate('/shop', { replace: true });
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleForgotPassword = async (emailOverride) => {
    setError('');
    setInfo('');
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured.');
      return;
    }
    const email = (emailOverride ?? loginEmail).trim();
    if (!email) {
      setError('Enter your email first, then tap Forgot password again.');
      return;
    }
    setLoading(true);
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appOrigin()}/auth`,
    });
    setLoading(false);
    if (resetErr) {
      setError(resetErr.message);
      return;
    }
    setInfo('Check your email for a password reset link.');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
      return;
    }
    setLoading(true);
    const { data, error: signErr } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });
    setLoading(false);
    if (signErr) {
      setError(signErr.message);
      return;
    }
    if (data.session) {
      navigate('/shop', { replace: true });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (signupPassword !== signupConfirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
      return;
    }
    const emailTrim = signupEmail.trim();
    setLoading(true);
    const { data, error: signErr } = await supabase.auth.signUp({
      email: emailTrim,
      password: signupPassword,
      options: {
        emailRedirectTo: `${appOrigin()}/auth`,
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
      },
    });
    setLoading(false);
    if (signErr) {
      setError(signErr.message);
      return;
    }
    if (data.session) {
      navigate('/shop', { replace: true });
      return;
    }
    setPendingConfirmEmail(emailTrim);
    setSignupAwaitingConfirmation(true);
  };

  return (
    <div className="page-auth pt-28 sm:pt-36 md:pt-40 pb-16 sm:pb-24 bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-24 max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-dark/10 mb-8 shadow-sm bg-white">
            <User className="w-6 h-6 text-dark/70" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-dark mb-4">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-dark/55 font-light text-lg leading-relaxed max-w-md mx-auto">
            {mode === 'login'
              ? 'Sign in to track orders and save your favorites.'
              : 'Join Aroma Tales for a smoother checkout and member perks.'}
          </p>
          <p className="text-dark/45 text-sm mt-6 max-w-md mx-auto leading-relaxed">
            <Link to="/track" className="font-semibold text-dark/75 underline underline-offset-2 hover:text-dark">
              Track an order
            </Link>{' '}
            with your order number and checkout email — no account required.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="auth-card bg-offwhite p-8 sm:p-10 md:p-14 border border-dark/5 shadow-[0_8px_40px_-12px_rgba(18,18,18,0.08)] rounded-[1.75rem] sm:rounded-[2rem]"
        >
          {!isSupabaseConfigured && (
            <p className="mb-8 text-center text-sm text-red-600 font-medium" role="alert">
              Supabase URL or anon key is missing — customer login will not work until .env is configured.
            </p>
          )}

          <div
            className="flex p-1 rounded-full bg-white border border-dark/8 mb-12 shadow-sm"
            role="tablist"
            aria-label="Authentication mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => setMode('login')}
              className={`flex-1 py-3 rounded-full text-[11px] uppercase tracking-[0.22em] font-bold transition-all duration-300 ${
                mode === 'login'
                  ? 'bg-dark text-white shadow-md'
                  : 'text-dark/45 hover:text-dark'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              onClick={() => setMode('signup')}
              className={`flex-1 py-3 rounded-full text-[11px] uppercase tracking-[0.22em] font-bold transition-all duration-300 ${
                mode === 'signup'
                  ? 'bg-dark text-white shadow-md'
                  : 'text-dark/45 hover:text-dark'
              }`}
            >
              Join
            </button>
          </div>

          {error && (
            <p className="mb-6 text-center text-sm text-red-600 font-medium" role="alert">
              {error}
            </p>
          )}
          {info && (
            <p className="mb-6 text-center text-sm text-dark/70 font-light leading-relaxed">
              {info}
            </p>
          )}

          {mode === 'signup' && signupAwaitingConfirmation && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-10 rounded-2xl border border-gold/35 bg-gold/[0.07] px-6 py-7 sm:px-8 text-center shadow-sm"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-dark text-gold mb-4">
                <Mail className="w-5 h-5" strokeWidth={1.75} aria-hidden />
              </div>
              <p className="text-[10px] uppercase tracking-[0.35em] font-bold text-gold mb-2">Almost there</p>
              <h2 className="font-serif text-2xl sm:text-3xl text-dark mb-3">Check your email</h2>
              <p className="text-dark/70 text-sm font-light leading-relaxed max-w-sm mx-auto mb-1">
                We sent a confirmation link to
              </p>
              <p className="text-dark font-medium text-sm break-all mb-5">{pendingConfirmEmail}</p>
              <p className="text-dark/55 text-xs font-light leading-relaxed max-w-sm mx-auto mb-6">
                Open the email and tap <strong className="text-dark/80 font-medium">Verify email</strong> to activate your
                account, then sign in here. If you don&rsquo;t see it, check spam or promotions.
              </p>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="inline-flex items-center justify-center py-3.5 px-8 rounded-full bg-dark text-white text-[11px] uppercase tracking-[0.28em] font-bold hover:bg-gold transition-colors"
              >
                Go to sign in
              </button>
              <button
                type="button"
                onClick={() => setSignupAwaitingConfirmation(false)}
                className="mt-4 block w-full text-center text-[11px] uppercase tracking-[0.2em] font-bold text-dark/45 hover:text-dark transition-colors"
              >
                Use a different email
              </button>
            </div>
          )}

          {mode === 'login' ? (
            <form className="space-y-10" onSubmit={handleLogin}>
              <div className="space-y-4">
                <label htmlFor="auth-email" className="text-[10px] uppercase tracking-[0.3em] font-bold text-dark/40 ml-1">
                  Email
                </label>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-dark/10 py-3 focus:border-dark transition-colors outline-none text-dark font-light placeholder:text-dark/25"
                  placeholder="you@example.com"
                />
              </div>
              <PasswordField
                id="auth-password"
                name="password"
                label="Password"
                autoComplete="current-password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
              />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                <label className="flex items-center gap-3 text-[11px] uppercase tracking-[0.15em] font-bold text-dark/45 cursor-pointer select-none">
                  <input type="checkbox" className="rounded border-dark/20 text-dark focus:ring-dark/20" />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => handleForgotPassword()}
                  disabled={loading}
                  className="text-[11px] uppercase tracking-[0.2em] font-bold text-dark/50 hover:text-dark transition-colors text-left sm:text-right disabled:opacity-40"
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-dark text-white text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-gold transition-colors shadow-lg disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          ) : signupAwaitingConfirmation ? null : (
            <form className="space-y-10" onSubmit={handleSignup}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label htmlFor="signup-first" className="text-[10px] uppercase tracking-[0.3em] font-bold text-dark/40 ml-1">
                    First name
                  </label>
                  <input
                    id="signup-first"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-transparent border-b border-dark/10 py-3 focus:border-dark transition-colors outline-none text-dark font-light placeholder:text-dark/25"
                    placeholder="Aroma"
                  />
                </div>
                <div className="space-y-4">
                  <label htmlFor="signup-last" className="text-[10px] uppercase tracking-[0.3em] font-bold text-dark/40 ml-1">
                    Last name
                  </label>
                  <input
                    id="signup-last"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-transparent border-b border-dark/10 py-3 focus:border-dark transition-colors outline-none text-dark font-light placeholder:text-dark/25"
                    placeholder="Tales"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label htmlFor="signup-email" className="text-[10px] uppercase tracking-[0.3em] font-bold text-dark/40 ml-1">
                  Email
                </label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-dark/10 py-3 focus:border-dark transition-colors outline-none text-dark font-light placeholder:text-dark/25"
                  placeholder="hello@aromatales.com"
                />
              </div>
              <PasswordField
                id="signup-password"
                name="password"
                label="Password"
                autoComplete="new-password"
                required
                minLength={6}
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
              <PasswordField
                id="signup-confirm"
                name="confirmPassword"
                label="Confirm password"
                autoComplete="new-password"
                required
                minLength={6}
                value={signupConfirm}
                onChange={(e) => setSignupConfirm(e.target.value)}
                placeholder="Repeat password"
              />
              <div className="flex flex-col items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleForgotPassword(signupEmail)}
                  disabled={loading}
                  className="text-[11px] uppercase tracking-[0.2em] font-bold text-dark/50 hover:text-dark transition-colors disabled:opacity-40"
                >
                  Forgot password?
                </button>
                <p className="text-[10px] text-dark/35 text-center font-light max-w-sm">
                  Uses the email on this form. Already registered? Switch to Sign in.
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-dark text-white text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-gold transition-colors shadow-lg disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          )}

          <p className="mt-12 text-center text-dark/45 text-sm font-light">
            By continuing you agree to our terms and privacy practices.
          </p>
          <div className="mt-8 text-center">
            <Link
              to="/shop"
              className="text-[11px] uppercase tracking-[0.25em] font-bold text-dark/40 hover:text-dark transition-colors"
            >
              ← Back to shop
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
