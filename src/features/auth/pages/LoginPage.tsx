/**
 * @module features/auth/pages
 * @description Login page — Email (admin) atau NPSN Sekolah (pengawas)
 * @api POST /api/auth/login
 */

import { useState } from 'react';
import { User, Key, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { apiClient, saveToken } from '../../../shared/services/api-client';

interface LoginProps {
  onLogin: (user: any, role: 'admin' | 'pengawas') => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]     = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await apiClient.auth.login({ identifier: identifier.trim(), password });

      if (res.success && res.token) {
        saveToken(res.token);
        onLogin(res.user, res.user.role as 'admin' | 'pengawas');
      } else {
        setError('Login gagal. Periksa kembali identitas dan password Anda.');
      }
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa koneksi dan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-accent to-primary-dark px-4 relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/4 right-0 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 rounded-full bg-white/5" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        {/* Card */}
        <div className="rounded-2xl bg-surface p-8 shadow-xl border border-border space-y-6">
          {/* Logo */}
          <div className="flex flex-col items-center text-center">
            <img src="/bsan_logo.png" className="h-16 w-16 object-contain rounded-2xl shadow-md mb-4 bg-white p-1" alt="BSAN Logo" />
            <h1 className="text-xl font-bold font-display text-text-primary">Survey BSAN Jawa Timur</h1>
            <p className="text-xs text-text-secondary mt-1">Sistem Monitoring Evaluasi Implementasi Mutu</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-status-belum/8 border border-status-belum/15 text-xs font-semibold text-status-belum">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 block">
                Email atau NPSN Sekolah
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
                <input
                  id="login-identifier"
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="admin@survasi.com atau NPSN"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-xl border border-border bg-bg/60 py-3 pl-10 pr-4 text-sm text-text-primary placeholder-text-secondary/50 focus:border-primary/40 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/10 transition-smooth"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 block">Kata Sandi</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-bg/60 py-3 pl-10 pr-10 text-sm text-text-primary placeholder-text-secondary/50 focus:border-primary/40 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/10 transition-smooth"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-primary hover:bg-primary-dark disabled:bg-primary/60 text-white py-3 text-sm font-bold shadow-lg shadow-primary/20 transition-smooth active:scale-[0.98] mt-2"
            >
              {isLoading ? 'Masuk...' : 'Masuk Dashboard'}
            </button>
          </form>

          <p className="text-center text-[10px] text-text-secondary/60">
            Admin: email · Pengawas: NPSN sekolah
          </p>
        </div>
      </div>
    </div>
  );
}
