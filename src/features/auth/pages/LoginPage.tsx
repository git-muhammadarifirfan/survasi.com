/**
 * @module features/auth/pages
 * @description Authentication page — Login & Separate Registration for Pengawas & Sekolah
 * @api POST /api/auth/login, POST /api/auth/register-sekolah, POST /api/auth/register-pengawas
 */

import { useState, useEffect } from 'react';
import { User, Key, Eye, EyeOff, AlertCircle, School, Mail, LogIn, UserPlus, CheckCircle2, Search, ShieldCheck, ArrowRight } from 'lucide-react';
import { apiClient, saveToken } from '../../../shared/services/api-client';

interface LoginProps {
  onLogin: (user: any, role: 'admin' | 'pengawas' | 'sekolah') => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regRole, setRegRole] = useState<'pengawas' | 'sekolah'>('sekolah');
  const [regNama, setRegNama] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regSekolahId, setRegSekolahId] = useState<number | ''>('');
  const [sekolahOptions, setSekolahOptions] = useState<any[]>([]);
  const [sekolahSearch, setSekolahSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // UI status state
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSekolah, setIsFetchingSekolah] = useState(false);

  // Fetch school options on mount / register tab focus
  useEffect(() => {
    if (activeTab === 'register' && regRole === 'sekolah' && sekolahOptions.length === 0) {
      setIsFetchingSekolah(true);
      apiClient.sekolah.getOptions()
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setSekolahOptions(res.data);
          }
        })
        .catch(() => {
          setError('Gagal memuat daftar sekolah dari database.');
        })
        .finally(() => setIsFetchingSekolah(false));
    }
  }, [activeTab, regRole]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await apiClient.auth.login({ identifier: identifier.trim(), password });

      if (res.success && res.token) {
        saveToken(res.token);
        if (res.user) {
          localStorage.setItem('bsan_user_profile', JSON.stringify(res.user));
        }
        onLogin(res.user, res.user.role as 'admin' | 'pengawas' | 'sekolah');
      } else {
        setError('Login gagal. Periksa kembali email/NPSN dan password Anda.');
      }
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa koneksi dan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (regPassword.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.');
      return;
    }

    setIsLoading(true);

    try {
      if (regRole === 'pengawas') {
        // Registrasi Pengawas (Email + Password + Confirm Password)
        const res = await apiClient.auth.registerPengawas({
          nama: regNama.trim(),
          email: regEmail.trim(),
          password: regPassword,
        });

        if (res.success && res.token) {
          saveToken(res.token);
          setSuccessMsg('Registrasi Pengawas berhasil! Mengalihkan ke Dashboard...');
          setTimeout(() => {
            onLogin(res.user, 'pengawas');
          }, 1200);
        } else {
          setError(res.message || 'Registrasi pengawas gagal.');
        }
      } else {
        // Registrasi Sekolah (Pilih sekolah dari database)
        if (!regSekolahId) {
          setError('Silakan pilih sekolah asal Anda dari daftar.');
          setIsLoading(false);
          return;
        }

        const res = await apiClient.auth.registerSekolah({
          nama: regNama.trim(),
          email: regEmail.trim(),
          password: regPassword,
          sekolah_id: Number(regSekolahId),
        });

        if (res.success && res.token) {
          saveToken(res.token);
          setSuccessMsg('Registrasi Sekolah berhasil! Mengalihkan ke Dashboard...');
          setTimeout(() => {
            onLogin(res.user, 'sekolah');
          }, 1200);
        } else {
          setError(res.message || 'Registrasi sekolah gagal.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Registrasi gagal. Coba lagi nanti.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSekolahOptions = sekolahOptions.filter((s) => {
    const q = sekolahSearch.toLowerCase();
    return s.nama.toLowerCase().includes(q) || s.npsn.includes(q) || s.kecamatan.toLowerCase().includes(q) || s.kabupaten.toLowerCase().includes(q);
  });

  const selectedSekolah = sekolahOptions.find((s) => s.id === regSekolahId);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-accent to-primary-dark px-4 py-8 relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/4 right-0 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 rounded-full bg-white/5" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        {/* Card */}
        <div className="rounded-2xl bg-surface p-6 lg:p-8 shadow-xl border border-border space-y-6">
          {/* Logo Header */}
          <div className="flex flex-col items-center text-center">
            <img src="/bsan_logo.png" className="h-14 w-14 object-contain rounded-2xl shadow-md mb-3 bg-white p-1" alt="BSAN Logo" />
            <h1 className="text-xl font-bold font-display text-text-primary">Survey BSAN Jawa Timur</h1>
            <p className="text-xs text-text-secondary mt-1">Sistem Monitoring Evaluasi Implementasi Mutu</p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-bg/80 p-1 border border-border">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-surface text-primary shadow-sm border border-border'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Masuk Akun</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('register'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-surface text-primary shadow-sm border border-border'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-status-belum/10 border border-status-belum/20 text-xs font-semibold text-status-belum">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                    placeholder="admin@survasi.com / pengawas / NPSN"
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
                className="w-full rounded-xl bg-primary hover:bg-primary-dark disabled:bg-primary/60 text-white py-3 text-sm font-bold shadow-lg shadow-primary/20 transition-smooth active:scale-[0.98] mt-2 cursor-pointer"
              >
                {isLoading ? 'Memverifikasi...' : 'Masuk Dashboard'}
              </button>

              {/* Sign Up Navigation Prompt */}
              <div className="pt-3 text-center border-t border-border mt-4">
                <p className="text-xs text-text-secondary mb-2">Belum memiliki akun pengguna?</p>
                <button
                  type="button"
                  onClick={() => { setActiveTab('register'); setError(''); setSuccessMsg(''); }}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer"
                >
                  <span>Sign Up / Daftar Akun Pengawas & Sekolah</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="pt-2 text-center text-[10px] text-text-secondary/70 leading-relaxed">
                <span className="font-bold text-text-primary">Panduan Login Role:</span><br />
                • Admin: <span className="font-mono text-primary">admin@survasi.com</span><br />
                • Pengawas: <span className="font-mono text-primary">pengawas@survasi.com</span> (atau email registrasi)<br />
                • Sekolah: Register atau masukan Email/NPSN sekolah
              </div>
            </form>
          ) : (
            /* REGISTER FORM (SEPARATED FOR PENGAWAS & SEKOLAH) */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Role Selection Tabs */}
              <div>
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 block">
                  Daftar Sebagai Stakeholder:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setRegRole('sekolah'); setError(''); }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                      regRole === 'sekolah'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-600 shadow-sm'
                        : 'bg-bg/40 border-border text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <School className="h-3.5 w-3.5" />
                    <span>Sekolah</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setRegRole('pengawas'); setError(''); }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                      regRole === 'pengawas'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 shadow-sm'
                        : 'bg-bg/40 border-border text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Pengawas</span>
                  </button>
                </div>
              </div>

              {/* Nama Input */}
              <div>
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 block">
                  {regRole === 'pengawas' ? 'Nama Lengkap Pengawas' : 'Nama Perwakilan / Operator Sekolah'}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder={regRole === 'pengawas' ? 'Contoh: Drs. Ahmad Fauzi, M.Pd' : 'Contoh: Budi Santoso, S.Pd'}
                    value={regNama}
                    onChange={(e) => setRegNama(e.target.value)}
                    className="w-full rounded-xl border border-border bg-bg/60 py-2.5 pl-10 pr-4 text-xs text-text-primary placeholder-text-secondary/50 focus:border-primary/40 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/10 transition-smooth"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 block">
                  Email Akun {regRole === 'pengawas' ? 'Pengawas' : 'Sekolah'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder={regRole === 'pengawas' ? 'pengawas@survasi.com' : 'sekolah@domain.sch.id'}
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-bg/60 py-2.5 pl-10 pr-4 text-xs text-text-primary placeholder-text-secondary/50 focus:border-primary/40 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/10 transition-smooth"
                  />
                </div>
              </div>

              {/* Dropdown Sekolah (HANYA UNTUK REGISTRASI SEKOLAH) */}
              {regRole === 'sekolah' && (
                <div>
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 block">
                    Pilih Satuan Pendidikan (Sekolah)
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full text-left rounded-xl border border-border bg-bg/60 py-2.5 pl-10 pr-4 text-xs text-text-primary focus:border-primary/40 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/10 transition-smooth flex items-center justify-between cursor-pointer"
                    >
                      <School className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
                      <span className="truncate">
                        {selectedSekolah
                          ? `${selectedSekolah.nama} (NPSN: ${selectedSekolah.npsn})`
                          : isFetchingSekolah
                          ? 'Memuat data sekolah...'
                          : '-- Pilih Sekolah Asal Anda --'}
                      </span>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-surface rounded-xl border border-border shadow-xl p-2 max-h-56 overflow-y-auto space-y-1">
                        <div className="sticky top-0 bg-surface pb-1.5 pt-0.5 border-b border-border">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary pointer-events-none" />
                            <input
                              type="text"
                              placeholder="Cari nama sekolah / NPSN / kecamatan..."
                              value={sekolahSearch}
                              onChange={(e) => setSekolahSearch(e.target.value)}
                              className="w-full rounded-lg border border-border bg-bg py-1.5 pl-8 pr-3 text-[11px] text-text-primary focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>

                        {filteredSekolahOptions.length === 0 ? (
                          <p className="text-[11px] text-text-secondary p-3 text-center">Sekolah tidak ditemukan</p>
                        ) : (
                          filteredSekolahOptions.slice(0, 50).map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setRegSekolahId(s.id);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left p-2 rounded-lg text-xs transition-colors hover:bg-primary/10 flex flex-col cursor-pointer ${
                                regSekolahId === s.id ? 'bg-primary/15 font-bold text-primary' : 'text-text-primary'
                              }`}
                            >
                              <span className="truncate">{s.nama}</span>
                              <span className="text-[10px] text-text-secondary">
                                NPSN: {s.npsn} • Kec. {s.kecamatan}, {s.kabupaten}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Password Input */}
              <div>
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 block">Kata Sandi</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimal 6 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-bg/60 py-2.5 pl-10 pr-10 text-xs text-text-primary placeholder-text-secondary/50 focus:border-primary/40 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/10 transition-smooth"
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

              {/* Confirm Password Input */}
              <div>
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 block">Konfirmasi Kata Sandi</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Ulangi kata sandi"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-bg/60 py-2.5 pl-10 pr-10 text-xs text-text-primary placeholder-text-secondary/50 focus:border-primary/40 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/10 transition-smooth"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full rounded-xl py-3 text-sm font-bold text-white shadow-lg transition-smooth active:scale-[0.98] mt-2 cursor-pointer ${
                  regRole === 'pengawas'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-accent hover:bg-accent-dark shadow-accent/20'
                }`}
              >
                {isLoading ? 'Mendaftarkan Akun...' : regRole === 'pengawas' ? 'Daftarkan Akun Pengawas' : 'Daftarkan Akun Sekolah'}
              </button>

              <div className="pt-3 text-center border-t border-border mt-4">
                <p className="text-xs text-text-secondary mb-1">Sudah memiliki akun terdaftar?</p>
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setError(''); setSuccessMsg(''); }}
                  className="text-xs font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer"
                >
                  Kembali ke Masuk Akun (Login)
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
