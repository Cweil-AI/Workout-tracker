'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type View = 'signin' | 'signup' | 'forgot';

export default function LoginPage() {
  const [view, setView] = useState<View>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function reset() {
    setError('');
    setMessage('');
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    reset();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('Incorrect email or password. If you just signed up, check your email for a confirmation link first.');
    setLoading(false);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    reset();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setMessage('Account created! If you are not logged in automatically, check your email for a confirmation link.');
    }
    setLoading(false);
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    reset();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset email sent! Check your inbox and follow the link.');
    }
    setLoading(false);
  }

  if (view === 'forgot') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
            <p className="text-gray-400 text-sm mt-1">Enter your email and we will send you a reset link</p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-3 text-base focus:outline-none focus:border-blue-500 placeholder-gray-600"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {message && <p className="text-green-400 text-sm">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm">
            <button
              onClick={() => { setView('signin'); reset(); }}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Back to sign in
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Workout Tracker</h1>
          <p className="text-gray-400 text-sm mt-1">
            {view === 'signup' ? 'Create an account to get started' : 'Sign in to your account'}
          </p>
        </div>

        <form onSubmit={view === 'signup' ? handleSignUp : handleSignIn} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-3 text-base focus:outline-none focus:border-blue-500 placeholder-gray-600"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Password</label>
              {view === 'signin' && (
                <button
                  type="button"
                  onClick={() => { setView('forgot'); reset(); }}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-3 text-base focus:outline-none focus:border-blue-500 placeholder-gray-600"
            />
            {view === 'signup' && (
              <p className="text-gray-600 text-xs">Must be at least 6 characters</p>
            )}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {message && <p className="text-green-400 text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
          >
            {loading ? 'Please wait...' : view === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm">
          {view === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setView(view === 'signup' ? 'signin' : 'signup'); reset(); }}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            {view === 'signup' ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}
