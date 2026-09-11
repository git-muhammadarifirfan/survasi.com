import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UnauthorizedPageProps {
  userRole?: 'admin' | 'pengawas' | 'sekolah';
  requiredRoles?: ('admin' | 'pengawas' | 'sekolah')[];
}

export default function UnauthorizedPage({ userRole = 'sekolah', requiredRoles = ['admin'] }: UnauthorizedPageProps) {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin Sistem';
      case 'pengawas': return 'Pengawas Sekolah';
      case 'sekolah': return 'Perwakilan Sekolah';
      default: return role;
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-6">
        <div className="absolute -inset-4 rounded-full bg-status-belum/10 blur-xl animate-pulse" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-status-belum/20 via-status-belum/10 to-amber-500/20 border border-status-belum/30 shadow-xl shadow-status-belum/10">
          <ShieldAlert className="h-12 w-12 text-status-belum animate-bounce-short" />
        </div>
        <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white border-2 border-surface shadow-md">
          <Lock className="h-4 w-4 text-amber-400" />
        </div>
      </div>

      <div className="max-w-md space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-status-belum/10 text-status-belum border border-status-belum/20">
          Error 403 • Restricted Access
        </span>
        
        <h1 className="text-2xl lg:text-3xl font-extrabold font-display text-text-primary tracking-tight">
          Akses Halaman Ditolak
        </h1>
        
        <p className="text-xs lg:text-sm text-text-secondary leading-relaxed">
          Maaf, akun Anda (<span className="font-semibold text-primary">{getRoleLabel(userRole)}</span>) tidak memiliki izin untuk membuka fitur ini.
        </p>

        <div className="p-3 rounded-2xl bg-bg/80 border border-border text-left space-y-1.5 text-xs text-text-secondary">
          <div className="flex justify-between">
            <span className="text-text-secondary/70">Role Akun Anda:</span>
            <span className="font-bold text-text-primary capitalize">{userRole}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary/70">Role yang diizinkan:</span>
            <span className="font-bold text-emerald-600 capitalize">{requiredRoles.map(getRoleLabel).join(', ')}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 rounded-xl bg-primary hover:bg-primary-dark text-white px-5 py-2.5 text-xs font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <Home className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}
