/**
 * @module features/auth/pages
 * @description Authentication Page — Login, Register, OTP Verify, Reset Password
 * @api POST /api/auth/login, /register-sekolah, /register-pengawas, /verify-otp, /reset-password
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User, KeyRound, Eye, EyeOff, AlertCircle, School, Mail, LogIn, UserPlus,
  CheckCircle2, Search, ShieldCheck, ArrowRight, ChevronRight,
  RefreshCw, Lock, ArrowLeft, Send
} from 'lucide-react';
import { apiClient, saveToken } from '../../../shared/services/api-client';
import { database } from '../../../shared/data/data-source';
import CustomSelect from '../../../shared/components/CustomSelect';
import BrevoEmailTemplate from '../components/BrevoEmailTemplate';
import { notifyToast } from '../../../shared/components/NotificationToast';

type AuthViewMode = 'login' | 'register' | 'forgot-password' | 'verify-otp' | 'reset-password-form' | 'email-preview';

interface LoginProps {
  onLogin: (user: any, role: 'admin' | 'pengawas' | 'sekolah') => void;
  initialMode?: AuthViewMode;
}

export default function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const getViewModeFromPath = (path: string): AuthViewMode => {
    if (path === '/register') return 'register';
    if (path === '/forgot-password') return 'forgot-password';
    if (path === '/verify-otp') return 'verify-otp';
    return 'login';
  };

  const [viewMode, setViewMode] = useState<AuthViewMode>(() => getViewModeFromPath(location.pathname));

  useEffect(() => {
    setViewMode(getViewModeFromPath(location.pathname));
  }, [location.pathname]);

  const switchMode = (mode: AuthViewMode) => {
    setError('');
    setSuccessMsg('');
    if (mode === 'login') navigate('/login');
    else if (mode === 'register') navigate('/register');
    else if (mode === 'forgot-password') navigate('/forgot-password');
    else if (mode === 'verify-otp') navigate('/verify-otp');
    else setViewMode(mode);
  };

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regRole, setRegRole] = useState<'pengawas' | 'sekolah'>('sekolah');
  const [regNama, setRegNama] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regSekolahNama, setRegSekolahNama] = useState('');
  const [regSekolahId, setRegSekolahId] = useState<number | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Forgot password & OTP state
  const [resetEmail, setResetEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const [resendTimer, setResendTimer] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // OTP flow tracking — what triggered the OTP screen
  const [otpPurpose, setOtpPurpose] = useState<'verification' | 'reset_password'>('verification');
  const [otpTargetEmail, setOtpTargetEmail] = useState('');
  const [otpTargetName, setOtpTargetName] = useState('');

  // Reset password new password form
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [verifiedOtpCode, setVerifiedOtpCode] = useState(''); // store verified OTP for reset

  // Pending registration data (token + user) to auto-login after OTP verification
  const [pendingAuthToken, setPendingAuthToken] = useState('');
  const [pendingAuthUser, setPendingAuthUser] = useState<any>(null);

  // Real-time schools data
  const [dbSchoolsList, setDbSchoolsList] = useState<any[]>([]);
  const [isFetchingSchools, setIsFetchingSchools] = useState(false);

  // UI Status state
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Hero carousel slide
  const [heroSlide, setHeroSlide] = useState(0);

  const heroFeatures = [
    {
      title: 'Pemantauan & Evaluasi Terintegrasi',
      desc: 'Sistem analisis real-time dan manajemen data terpadu untuk efisiensi dan transparansi.',
      badge: 'Sistem Terpadu',
    },
    {
      title: 'Keamanan Otentikasi Terjamin',
      desc: 'Perlindungan verifikasi kode OTP dan pemulihan akun cepat melalui sistem email otomatis.',
      badge: 'Keamanan Tinggi',
    },
    {
      title: 'Matriks Analisis & Pelaporan',
      desc: 'Visualisasi data komprehensif, pemetaan instrumen, dan analisis statistik terstruktur.',
      badge: 'Dasbor Eksekutif',
    },
  ];

  // Auto rotate hero slide every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroFeatures.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real schools from database for registration
  useEffect(() => {
    if (viewMode === 'register' && dbSchoolsList.length === 0) {
      setIsFetchingSchools(true);
      database.getSchools()
        .then((schools) => {
          setDbSchoolsList(schools);
        })
        .catch(() => { })
        .finally(() => setIsFetchingSchools(false));
    }
  }, [viewMode]);

  // Timer cooldown for OTP resend
  useEffect(() => {
    let interval: any = null;
    if (viewMode === 'verify-otp' && resendTimer > 0) {
      setCanResend(false);
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [viewMode, resendTimer]);

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!identifier.trim() || !password) {
      setError('Harap isi email/NPSN dan kata sandi Anda.');
      return;
    }

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
        setError('Login gagal. Periksa kembali email/NPSN dan kata sandi Anda.');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal terhubung ke server otentikasi. Silakan periksa koneksi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register Submit -> Triggers OTP Verification Screen
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regNama || !regEmail || !regPassword) {
      setError('Harap lengkapi semua bidang isian pendaftaran.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (regRole === 'sekolah' && !regSekolahId) {
      setError('Harap pilih Satuan Pendidikan (Sekolah) Anda dari daftar.');
      return;
    }

    if (!agreeTerms) {
      setError('Anda harus menyetujui Syarat & Ketentuan Layanan.');
      return;
    }

    setIsLoading(true);

    try {
      let res: any;
      if (regRole === 'pengawas') {
        res = await apiClient.auth.registerPengawas({
          nama: regNama.trim(),
          email: regEmail.trim(),
          password: regPassword,
        });
      } else {
        res = await apiClient.auth.registerSekolah({
          nama: regNama.trim(),
          email: regEmail.trim(),
          password: regPassword,
          sekolah_id: Number(regSekolahId),
          sekolah_nama: regSekolahNama || undefined,
        });
      }

      // Save token + user for auto-login after OTP verification
      if (res.token) setPendingAuthToken(res.token);
      if (res.user) setPendingAuthUser(res.user);

      // Set OTP flow state
      setOtpPurpose('verification');
      setOtpTargetEmail(regEmail.trim());
      setOtpTargetName(regNama.trim());
      setResendTimer(30);
      setOtpDigits(Array(6).fill(''));
      switchMode('verify-otp');
      notifyToast({
        type: 'info',
        title: 'Kode OTP Dikirim ke Email',
        message: `Kode verifikasi OTP 6-digit telah dikirimkan ke email ${regEmail}. Silakan periksa kotak masuk (inbox) atau folder spam email Anda.`,
      });
    } catch (err: any) {
      const errMsg = err.message || 'Pendaftaran gagal. Silakan periksa data Anda dan coba lagi.';
      setError(errMsg);
      notifyToast({
        type: 'warning',
        title: 'Pendaftaran Tidak Dapat Dilanjutkan',
        message: errMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password Submit -> Triggers OTP Verification Screen
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!resetEmail.trim()) {
      setError('Masukkan alamat email terdaftar Anda.');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.auth.forgotPassword({ email: resetEmail.trim() });
      setOtpPurpose('reset_password');
      setOtpTargetEmail(resetEmail.trim());
      setOtpTargetName('');
      setResendTimer(30);
      setOtpDigits(Array(6).fill(''));
      switchMode('verify-otp');
      notifyToast({
        type: 'info',
        title: 'Kode Reset Dikirim ke Email',
        message: `Kode reset kata sandi 6-digit telah dikirimkan ke email ${resetEmail}. Silakan periksa kotak masuk (inbox) atau folder spam email Anda.`,
      });
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim kode reset kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Input Box Change
  const handleOtpDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste of 6 digits
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      const newDigits = [...otpDigits];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    const char = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP — calls server-side verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpDigits.join('');
    if (fullCode.length < 6) {
      setError('Harap masukkan 6-digit kode OTP secara lengkap.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await apiClient.auth.verifyOtp({
        email: otpTargetEmail,
        otp_code: fullCode,
      });

      if (res.success && res.verified) {
        if (res.type === 'reset_password') {
          // OTP verified for password reset → show new password form
          setVerifiedOtpCode(fullCode);
          setNewPassword('');
          setNewPasswordConfirm('');
          setViewMode('reset-password-form');
          notifyToast({
            type: 'success',
            title: 'Kode OTP Valid',
            message: 'Silakan masukkan kata sandi baru Anda.',
          });
        } else {
          // Registration verification complete → auto-login
          if (pendingAuthToken && pendingAuthUser) {
            saveToken(pendingAuthToken);
            localStorage.setItem('bsan_user_profile', JSON.stringify(pendingAuthUser));
            notifyToast({
              type: 'success',
              title: 'Verifikasi & Login Berhasil',
              message: 'Akun Anda berhasil diverifikasi. Selamat datang!',
            });
            onLogin(pendingAuthUser, pendingAuthUser.role as 'admin' | 'pengawas' | 'sekolah');
          } else {
            // Fallback if token was lost
            notifyToast({
              type: 'success',
              title: 'Verifikasi Berhasil',
              message: 'Akun Anda berhasil diverifikasi! Silakan masuk.',
            });
            switchMode('login');
            setSuccessMsg('Verifikasi akun berhasil. Silakan masuk dengan kata sandi Anda.');
          }
        }
      } else {
        setError(res.message || 'Verifikasi OTP gagal.');
      }
    } catch (err: any) {
      setError(err.message || 'Kode OTP salah atau sudah kedaluwarsa.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Reset Password Submit (after OTP verified)
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !newPasswordConfirm) {
      setError('Harap isi kata sandi baru dan konfirmasinya.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Kata sandi baru minimal 6 karakter.');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiClient.auth.resetPassword({
        email: otpTargetEmail,
        otp_code: verifiedOtpCode,
        new_password: newPassword,
      });

      if (res.success) {
        notifyToast({
          type: 'success',
          title: 'Kata Sandi Berhasil Diubah',
          message: 'Silakan masuk dengan kata sandi baru Anda.',
        });
        switchMode('login');
        setSuccessMsg('Kata sandi berhasil diubah. Silakan masuk dengan kata sandi baru Anda.');
        setVerifiedOtpCode('');
      } else {
        setError(res.message || 'Gagal mengubah kata sandi.');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah kata sandi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setError('');
    setIsLoading(true);

    try {
      await apiClient.auth.resendOtp({
        email: otpTargetEmail,
        nama: otpTargetName || 'Pengguna Survasi',
        type: otpPurpose,
      });
      setResendTimer(30);
      setCanResend(false);
      setOtpDigits(Array(6).fill(''));

      notifyToast({
        type: 'info',
        title: 'Kode OTP Baru Dikirim (Kode Lama Hangus)',
        message: `Kode OTP 6-digit baru telah dikirimkan ke email ${otpTargetEmail}. Silakan periksa inbox / spam email Anda.`,
      });
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim ulang kode OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl rounded-3xl bg-surface border border-border shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px] animate-fade-in">

        {/* ═══════════════════════════════════════════════════════════════════
            LEFT COLUMN: Interactive Form Container
           ═══════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-6 xl:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-6">

          {/* Top Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-lg border border-emerald-500/20 shadow-xs">
                S
              </div>
              <div>
                <h1 className="text-base font-extrabold font-display text-text-primary tracking-tight leading-none">
                  Survasi <span className="text-emerald-600">Platform</span>
                </h1>
                <p className="text-[10px] text-text-secondary font-medium mt-0.5">
                  Sistem Evaluasi & Monitoring Terpadu
                </p>
              </div>
            </div>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold flex items-start space-x-2.5 animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold flex items-start space-x-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ═════ SUB-VIEW 1: LOGIN MODE ═════ */}
          {viewMode === 'login' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold font-display text-text-primary tracking-tight">
                  Masuk ke Akun Anda
                </h2>
                <p className="text-xs text-text-secondary">
                  Silakan masukkan email atau ID terdaftar Anda untuk melanjutkan ke dasbor.
                </p>
              </div>

              {/* View Switcher Tabs (Masuk vs Daftar) */}
              <div className="flex bg-bg/80 p-1 rounded-2xl border border-border">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="flex-1 h-10 py-2 text-xs sm:text-sm font-bold rounded-xl bg-surface text-emerald-600 shadow-xs transition cursor-pointer"
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="flex-1 h-10 py-2 text-xs sm:text-sm font-bold rounded-xl text-text-secondary hover:text-text-primary transition cursor-pointer"
                >
                  Daftar Akun Baru
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-text-secondary uppercase text-[10px]">Email atau ID Pengguna</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="user@survasi.com atau ID Sekolah"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full h-11 rounded-2xl border border-border bg-bg py-2.5 pl-10 pr-4 text-xs sm:text-sm text-text-primary placeholder-text-secondary/60 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-text-secondary uppercase text-[10px]">Kata Sandi</label>
                    <button
                      type="button"
                      onClick={() => switchMode('forgot-password')}
                      className="text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Masukkan kata sandi Anda"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 rounded-2xl border border-border bg-bg py-2.5 pl-10 pr-10 text-xs sm:text-sm text-text-primary placeholder-text-secondary/60 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 transition"
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

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-emerald-600 focus:ring-emerald-600/20 cursor-pointer"
                    />
                    <span className="text-xs text-text-secondary font-medium">Ingat saya di perangkat ini</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Memproses Otentikasi...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      <span>Masuk ke Dasbor</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ═════ SUB-VIEW 2: REGISTER MODE ═════ */}
          {viewMode === 'register' && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold font-display text-text-primary tracking-tight">
                  Pendaftaran Akun Baru
                </h2>
                <p className="text-xs text-text-secondary">
                  Daftarkan akun Perwakilan Satuan Pendidikan atau Pengawas Pembina.
                </p>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex bg-bg/80 p-1 rounded-2xl border border-border">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="flex-1 h-10 py-2 text-xs sm:text-sm font-bold rounded-xl text-text-secondary hover:text-text-primary transition cursor-pointer"
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="flex-1 h-10 py-2 text-xs sm:text-sm font-bold rounded-xl bg-surface text-emerald-600 shadow-xs transition cursor-pointer"
                >
                  Daftar Akun Baru
                </button>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                {/* Role Switcher */}
                <div className="space-y-1">
                  <label className="font-bold text-text-secondary uppercase text-[10px]">Peran Pengguna</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole('sekolah')}
                      className={`h-10 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${regRole === 'sekolah'
                          ? 'bg-emerald-500/10 border-emerald-600 text-emerald-600 shadow-xs'
                          : 'bg-bg border-border text-text-secondary hover:bg-bg/80'
                        }`}
                    >
                      <School className="h-4 w-4 shrink-0" />
                      <span>Perwakilan Sekolah</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('pengawas')}
                      className={`h-10 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${regRole === 'pengawas'
                          ? 'bg-emerald-500/10 border-emerald-600 text-emerald-600 shadow-xs'
                          : 'bg-bg border-border text-text-secondary hover:bg-bg/80'
                        }`}
                    >
                      <User className="h-4 w-4 shrink-0" />
                      <span>Pengawas Pembina</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-text-secondary uppercase text-[10px]">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nama lengkap Anda"
                    value={regNama}
                    onChange={(e) => setRegNama(e.target.value)}
                    className="w-full h-11 rounded-2xl border border-border bg-bg py-2.5 px-3.5 text-xs sm:text-sm text-text-primary focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-text-secondary uppercase text-[10px]">Alamat Email Resmi *</label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full h-11 rounded-2xl border border-border bg-bg py-2.5 px-3.5 text-xs sm:text-sm text-text-primary focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                {regRole === 'sekolah' && (
                  <div className="space-y-1">
                    <CustomSelect
                      label="Satuan Pendidikan (Sekolah) *"
                      options={[
                        { value: '', label: isFetchingSchools ? 'Memuat daftar sekolah...' : '-- Pilih / Cari Sekolah Sasaran --' },
                        ...dbSchoolsList.map((s) => ({
                          value: String(s.id),
                          label: `${s.nama} (${s.npsn || 'NPSN'}) • Kec. ${s.kecamatan}`,
                        })),
                      ]}
                      value={regSekolahId !== null ? String(regSekolahId) : ''}
                      onChange={(val) => {
                        if (!val) {
                          setRegSekolahId(null);
                          setRegSekolahNama('');
                        } else {
                          const numVal = Number(val);
                          setRegSekolahId(numVal);
                          const match = dbSchoolsList.find((s) => String(s.id) === String(val));
                          if (match) setRegSekolahNama(match.nama);
                        }
                      }}
                      placeholder="Cari nama atau NPSN sekolah..."
                      enableSearch={true}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-text-secondary uppercase text-[10px]">Kata Sandi *</label>
                    <input
                      type="password"
                      required
                      placeholder="Minimal 6 karakter"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full h-11 rounded-2xl border border-border bg-bg py-2.5 px-3.5 text-xs sm:text-sm text-text-primary focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-text-secondary uppercase text-[10px]">Konfirmasi Sandi *</label>
                    <input
                      type="password"
                      required
                      placeholder="Ulangi kata sandi"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full h-11 rounded-2xl border border-border bg-bg py-2.5 px-3.5 text-xs sm:text-sm text-text-primary focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <label className="flex items-start space-x-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border text-emerald-600 focus:ring-emerald-600/20 cursor-pointer shrink-0"
                  />
                  <span className="text-[11px] text-text-secondary leading-relaxed">
                    Saya menyetujui Ketentuan Layanan & Kebijakan Privasi Sistem. Kode verifikasi berlaku 30 menit.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Mendaftarkan & Mengirim Kode Verifikasi...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Daftarkan Akun</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ═════ SUB-VIEW 3: FORGOT PASSWORD MODE ═════ */}
          {viewMode === 'forgot-password' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-xs font-bold text-emerald-600 hover:underline flex items-center space-x-1 cursor-pointer mb-2"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Kembali ke Halaman Masuk</span>
                </button>
                <h2 className="text-2xl font-bold font-display text-text-primary tracking-tight">
                  Lupa Kata Sandi Akun
                </h2>
                <p className="text-xs text-text-secondary">
                  Masukkan email terdaftar Anda. Kami akan mengirimkan 6-digit kode OTP pemulihan kata sandi (berlaku 30 menit).
                </p>
              </div>

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-text-secondary uppercase text-[10px]">Alamat Email Terdaftar</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="user@survasi.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full h-11 rounded-2xl border border-border bg-bg py-2.5 pl-10 pr-4 text-xs sm:text-sm text-text-primary focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Mengirim Kode Reset...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Kirim Kode Reset OTP</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ═════ SUB-VIEW 4: VERIFY OTP MODE ═════ */}
          {viewMode === 'verify-otp' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-xs font-bold text-emerald-600 hover:underline flex items-center space-x-1 cursor-pointer mb-2"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Batal & Kembali ke Login</span>
                </button>
                <h2 className="text-2xl font-bold font-display text-text-primary tracking-tight">
                  Verifikasi Kode OTP Email
                </h2>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Kode 6-digit dikirim ke email <strong className="text-text-primary">{otpTargetEmail || 'email Anda'}</strong>. Kode ini berlaku selama <strong>30 menit</strong>. Periksa folder inbox dan spam email Anda.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5 text-xs">
                {/* 6 OTP Input Boxes */}
                <div className="flex items-center justify-between gap-2 max-w-sm mx-auto my-2">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpInputRefs.current[index] = el; }}
                      type="text"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-11 h-13 text-center text-xl font-extrabold font-mono rounded-2xl border-2 border-border bg-bg text-text-primary focus:border-emerald-600 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition shadow-xs"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-text-secondary font-medium">Tidak menerima kode?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={!canResend}
                    className="font-bold text-emerald-600 disabled:text-text-secondary/50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 hover:underline"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${!canResend ? 'animate-spin' : ''}`} />
                    <span>{canResend ? 'Kirim Ulang Kode' : `Kirim Ulang (${resendTimer}s)`}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Memverifikasi Kode...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Verifikasi & Lanjutkan</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ═════ SUB-VIEW 5: RESET PASSWORD FORM (after OTP verified) ═════ */}
          {viewMode === 'reset-password-form' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-xs font-bold text-emerald-600 hover:underline flex items-center space-x-1 cursor-pointer mb-2"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Batal & Kembali ke Login</span>
                </button>
                <h2 className="text-2xl font-bold font-display text-text-primary tracking-tight">
                  Atur Kata Sandi Baru
                </h2>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Kode OTP berhasil diverifikasi untuk <strong className="text-text-primary">{otpTargetEmail}</strong>. Silakan masukkan kata sandi baru Anda.
                </p>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-text-secondary uppercase text-[10px]">Kata Sandi Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimal 6 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-11 rounded-2xl border border-border bg-bg py-2.5 pl-10 pr-10 text-xs sm:text-sm text-text-primary placeholder-text-secondary/60 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-text-secondary uppercase text-[10px]">Konfirmasi Kata Sandi Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Ulangi kata sandi baru"
                      value={newPasswordConfirm}
                      onChange={(e) => setNewPasswordConfirm(e.target.value)}
                      className="w-full h-11 rounded-2xl border border-border bg-bg py-2.5 pl-10 pr-4 text-xs sm:text-sm text-text-primary placeholder-text-secondary/60 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Menyimpan Kata Sandi Baru...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      <span>Simpan Kata Sandi Baru</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ═════ SUB-VIEW 6: BREVO EMAIL PREVIEW MODE ═════ */}
          {viewMode === 'email-preview' && (
            <div className="space-y-4 animate-fade-in">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-xs font-bold text-emerald-600 hover:underline flex items-center space-x-1 cursor-pointer mb-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Kembali ke Halaman Utama</span>
              </button>
              <BrevoEmailTemplate
                recipientEmail={regEmail || resetEmail || 'user@survasi.com'}
                recipientName={regNama || 'Sahabat Survasi'}
                otpCode={otpDigits.join('') || '849201'}
                type={resetEmail ? 'reset_password' : 'verification'}
              />
            </div>
          )}

          {/* Clean User-Friendly Footer */}
          <div className="pt-4 border-t border-border/60 text-center text-[11px] text-text-secondary">
            <span>© 2026 Survasi. Hak Cipta Dilindungi.</span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            RIGHT COLUMN: Clean Emerald Hero Visual Section with SVG Illustration
           ═══════════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-6 bg-emerald-600 p-8 xl:p-10 text-white flex-col justify-between relative overflow-hidden">

          {/* Main Visual Illustration & Carousel Container */}
          <div className="relative z-10 my-auto py-4 text-center space-y-6">
            
            {/* SVG Illustration from public/Mobile login-bro.svg */}
            <div className="flex items-center justify-center min-h-[260px]">
              <img
                src="/Mobile login-bro.svg"
                alt="Otentikasi System"
                className="w-full max-w-[280px] h-auto object-contain drop-shadow-md transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Dynamic Auto-Sliding Carousel Feature Text */}
            <div className="space-y-2 max-w-sm mx-auto min-h-[80px]">
              <h3 className="text-xl font-bold font-display text-white tracking-tight leading-snug">
                {heroFeatures[heroSlide].title}
              </h3>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                {heroFeatures[heroSlide].desc}
              </p>
            </div>

            {/* Carousel Navigation Dots */}
            <div className="flex justify-center space-x-2 pt-1">
              {heroFeatures.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setHeroSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    heroSlide === idx ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Bottom Footer Notice */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-emerald-100/80">
            <span>Survasi Monitoring Platform © 2026</span>
          </div>

        </div>

      </div>
    </div>
  );
}
