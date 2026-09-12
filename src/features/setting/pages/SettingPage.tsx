import React, { useState, useEffect } from 'react';
import {
  User, Shield, Bell, Globe, Save, Lock, Key, RefreshCw, Check, CheckCircle2,
  AlertCircle, Eye, EyeOff, Laptop, Building2, Phone, Mail, FileText, BadgeCheck
} from 'lucide-react';
import CustomSelect from '../../../shared/components/CustomSelect';
import { notifyToast } from '../../../shared/components/NotificationToast';
import { apiClient } from '../../../shared/services/api-client';

type SettingTabType = 'profile' | 'security' | 'notif' | 'pref';

export default function Setting() {
  const [userRole, setUserRole] = useState<'admin' | 'pengawas' | 'sekolah'>('admin');
  const [activeTab, setActiveTab] = useState<SettingTabType>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Form State
  const [profile, setProfile] = useState({
    nama: '',
    email: '',
    phone: '',
    nip: '',
    instansi: '',
    jabatan: '',
  });

  // Security & Password Form State
  const [passwords, setPasswords] = useState({
    old: '',
    new: '',
    confirm: '',
  });
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Notification Preferences State
  const [notif, setNotif] = useState({
    weeklyReport: true,
    instantAlert: true,
    reminderEmail: true,
    systemUpdate: true,
  });

  // System & Dashboard Preferences State
  const [pref, setPref] = useState({
    language: 'id',
    theme: 'light',
    autoSaveInterval: 30,
  });

  // Load User Configuration & Profile from Database
  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // Load user profile from DB
        const resProfile = await apiClient.setting.getProfile();
        if (isMounted && resProfile?.success && resProfile?.data) {
          const data = resProfile.data;
          setProfile({
            nama: data.nama || '',
            email: data.email || '',
            phone: data.phone || '',
            nip: data.nip || '',
            instansi: data.instansi || data.sekolah_nama || 'Instansi Terdaftar',
            jabatan: data.jabatan || '',
          });
          setUserRole(data.role || 'admin');
        }

        // Load user preferences from DB
        const resPref = await apiClient.setting.getPreferences();
        if (isMounted && resPref?.success && resPref?.data) {
          const p = resPref.data;
          setPref({
            language: p.bahasa || 'id',
            theme: p.tema || 'light',
            autoSaveInterval: p.auto_save_interval || 30,
          });
          setNotif({
            weeklyReport: p.notif_weekly_report !== false,
            instantAlert: p.notif_instant_alert !== false,
            reminderEmail: p.notif_reminder_email !== false,
            systemUpdate: p.notif_system_update !== false,
          });
        }
      } catch (err) {
        // Fallback to local storage profile if offline / error
        const saved = localStorage.getItem('bsan_user_profile');
        if (saved && isMounted) {
          try {
            const parsed = JSON.parse(saved);
            setProfile({
              nama: parsed.nama || '',
              email: parsed.email || '',
              phone: parsed.telepon || parsed.phone || '',
              nip: parsed.nip || '',
              instansi: parsed.instansi || '',
              jabatan: parsed.jabatan || '',
            });
            setUserRole(parsed.role || 'admin');
          } catch { }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchUserData();
    return () => { isMounted = false; };
  }, []);

  // Compute Password Strength
  const computePasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Kosong', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 6) score += 25;
    if (pwd.length >= 10) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9!@#$%^&*]/.test(pwd)) score += 25;

    if (score <= 25) return { score: 25, label: 'Lemah', color: 'bg-rose-500' };
    if (score <= 50) return { score: 50, label: 'Sedang', color: 'bg-amber-500' };
    if (score <= 75) return { score: 75, label: 'Bagus', color: 'bg-indigo-500' };
    return { score: 100, label: 'Sangat Kuat', color: 'bg-emerald-500' };
  };

  const pwdStrength = computePasswordStrength(passwords.new);

  // Handle Profile Update Submission
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await apiClient.setting.updateProfile({
        nama: profile.nama,
        phone: profile.phone,
        jabatan: profile.jabatan,
        instansi: profile.instansi,
      });

      if (res?.success) {
        // Local state sync
        const updatedProfile = {
          ...profile,
          role: userRole,
        };
        localStorage.setItem('bsan_user_profile', JSON.stringify(updatedProfile));

        notifyToast({
          type: 'success',
          title: 'Profil Berhasil Diperbarui',
          message: 'Data profil identitas Anda telah diperbarui di database.',
        });
      } else {
        notifyToast({
          type: 'error',
          title: 'Gagal Menyimpan',
          message: res?.message || 'Terjadi kesalahan saat menyimpan profil.',
        });
      }
    } catch (err: any) {
      notifyToast({
        type: 'error',
        title: 'Error Koneksi',
        message: err.message || 'Gagal terhubung ke server.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Password Change Submission
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.old) {
      notifyToast({ type: 'warning', title: 'Perhatian', message: 'Masukkan kata sandi lama Anda.' });
      return;
    }
    if (!passwords.new || passwords.new.length < 6) {
      notifyToast({ type: 'warning', title: 'Perhatian', message: 'Kata sandi baru minimal 6 karakter.' });
      return;
    }
    if (passwords.new !== passwords.confirm) {
      notifyToast({ type: 'error', title: 'Validasi Gagal', message: 'Konfirmasi kata sandi baru tidak cocok.' });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await apiClient.auth.changePassword({
        current_password: passwords.old,
        new_password: passwords.new,
      });

      if (res?.success) {
        setPasswords({ old: '', new: '', confirm: '' });
        notifyToast({
          type: 'success',
          title: 'Sandi Diubah',
          message: 'Kata sandi akun Anda telah berhasil diperbarui.',
        });
      } else {
        notifyToast({
          type: 'error',
          title: 'Gagal Mengubah Sandi',
          message: res?.message || 'Password lama tidak sesuai.',
        });
      }
    } catch (err: any) {
      notifyToast({
        type: 'error',
        title: 'Error Server',
        message: err.message || 'Terjadi kesalahan pada server.',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle Preferences & Notifications Save
  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      const res = await apiClient.setting.updatePreferences({
        bahasa: pref.language,
        tema: pref.theme,
        auto_save_interval: pref.autoSaveInterval,
        notif_weekly_report: notif.weeklyReport,
        notif_instant_alert: notif.instantAlert,
        notif_reminder_email: notif.reminderEmail,
        notif_system_update: notif.systemUpdate,
      });

      if (res?.success) {
        notifyToast({
          type: 'success',
          title: 'Preferensi Disimpan',
          message: 'Pengaturan preferensi dasbor & kanal notifikasi berhasil disimpan.',
        });
      }
    } catch (err: any) {
      notifyToast({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: err.message || 'Gagal menyimpan preferensi.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-xs text-text-secondary font-medium">Memuat Pengaturan Akun...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header Card */}
      <div className="rounded-2xl bg-surface p-6 shadow-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-text-primary flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <span>Pengaturan Akun & Profil Stakeholder</span>
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Kelola profil identitas, keamanan akun, dan preferensi dasbor sistem.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 capitalize flex items-center gap-1.5">
            <BadgeCheck className="h-3.5 w-3.5 text-primary" />
            <span>Peran: {userRole}</span>
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Terverifikasi</span>
          </span>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Navigation Tabs */}
        <div className="lg:col-span-4 xl:col-span-3 rounded-2xl bg-surface p-3 shadow-card border border-border space-y-1 h-fit">
          {[
            { id: 'profile', label: 'Profil Pengguna', icon: User, desc: 'Identitas & Peran' },
            { id: 'security', label: 'Keamanan & Sandi', icon: Shield, desc: 'Kata Sandi & Akses' },
            { id: 'notif', label: 'Kanal Notifikasi', icon: Bell, desc: 'Email Alert & Laporan' },
            { id: 'pref', label: 'Preferensi Dasbor', icon: Globe, desc: 'Bahasa & Autotimer' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as SettingTabType)}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.01]'
                  : 'text-text-secondary hover:bg-bg hover:text-text-primary'
                  }`}
              >
                <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-bg text-text-secondary'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-bold leading-none">{tab.label}</p>
                  <p className={`text-[10px] mt-1 ${isActive ? 'text-white/80' : 'text-text-secondary/70'}`}>
                    {tab.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Tab Content Card */}
        <div className="lg:col-span-8 xl:col-span-9 rounded-2xl bg-surface p-6 shadow-card border border-border">

          {/* ═══════════════════════════════════════════════════════════════
              TAB 1: PROFIL PENGGUNA
             ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6 text-xs animate-fade-in">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-sm text-text-primary font-display flex items-center space-x-2">
                  <User className="h-4 w-4 text-primary" />
                  <span>Informasi Identitas Diri</span>
                </h3>
              </div>

              {/* Profile Card Header */}
              <div className="p-4 rounded-2xl bg-bg/60 border border-border flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xl border-2 border-primary/20 shadow-xs shrink-0">
                  {profile.nama ? profile.nama.substring(0, 2).toUpperCase() : 'US'}
                </div>
                <div className="space-y-1 text-center sm:text-left flex-1">
                  <h4 className="font-bold text-sm text-text-primary">{profile.nama || 'Pengguna Survasi'}</h4>
                  <p className="text-xs text-text-secondary">{profile.jabatan || 'Stakeholder System'}</p>
                  <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase">
                      {userRole}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-surface text-text-secondary border border-border">
                      {profile.instansi || 'Instansi Terdaftar'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-text-secondary uppercase text-[10px]">Nama Lengkap Pengguna *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={profile.nama}
                      onChange={(e) => setProfile({ ...profile, nama: e.target.value })}
                      className="w-full rounded-xl border border-border bg-bg pl-9 pr-3 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-text-secondary uppercase text-[10px]">Alamat Email (Akun Login)</label>
                  <div className="relative">
                    <input
                      type="email"
                      disabled
                      value={profile.email}
                      className="w-full rounded-xl border border-border bg-border/30 pl-9 pr-3 py-2.5 text-xs text-text-secondary cursor-not-allowed font-medium"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-text-secondary uppercase text-[10px]">NIP / NUPTK / Identitas</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profile.nip}
                      onChange={(e) => setProfile({ ...profile, nip: e.target.value })}
                      placeholder="Masukkan NIP jika ada"
                      className="w-full rounded-xl border border-border bg-bg pl-9 pr-3 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                    />
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-text-secondary uppercase text-[10px]">Nomor Telepon / WhatsApp</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="0812xxxxxxx"
                      className="w-full rounded-xl border border-border bg-bg pl-9 pr-3 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                    />
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-text-secondary uppercase text-[10px]">Jabatan / Peran Dinas</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profile.jabatan}
                      onChange={(e) => setProfile({ ...profile, jabatan: e.target.value })}
                      placeholder="Misal: Kepala Sekolah / Pengawas Pembina"
                      className="w-full rounded-xl border border-border bg-bg pl-9 pr-3 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                    />
                    <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-text-secondary uppercase text-[10px]">Instansi / Sekolah</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profile.instansi}
                      onChange={(e) => setProfile({ ...profile, instansi: e.target.value })}
                      placeholder="Nama Instansi"
                      className="w-full rounded-xl border border-border bg-bg pl-9 pr-3 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                    />
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  </div>
                </div>
              </div>

              {/* Submit Button Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-[10px] text-text-secondary font-medium">
                  Perubahan akan diperbarui langsung di database.
                </span>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center space-x-2 rounded-2xl bg-primary hover:bg-primary-dark disabled:bg-primary/70 text-white px-6 py-2.5 font-bold shadow-lg shadow-primary/20 transition-all cursor-pointer hover:scale-[1.01]"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Simpan Profil</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB 2: KEAMANAN & SANDI
             ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-6 text-xs animate-fade-in">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-sm text-text-primary font-display flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Keamanan Akun & Perubahan Kata Sandi</span>
                </h3>
              </div>

              <div className="space-y-4 max-w-md">
                <div className="space-y-1">
                  <label className="font-bold text-text-secondary uppercase text-[10px]">Kata Sandi Saat Ini *</label>
                  <div className="relative">
                    <input
                      type={showPass.old ? 'text' : 'password'}
                      required
                      value={passwords.old}
                      onChange={(e) => setPasswords({ ...passwords, old: e.target.value })}
                      placeholder="Masukkan sandi lama"
                      className="w-full rounded-xl border border-border bg-bg pl-3 pr-10 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass({ ...showPass, old: !showPass.old })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    >
                      {showPass.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-text-secondary uppercase text-[10px]">Kata Sandi Baru *</label>
                  <div className="relative">
                    <input
                      type={showPass.new ? 'text' : 'password'}
                      required
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      placeholder="Minimal 6 karakter"
                      className="w-full rounded-xl border border-border bg-bg pl-3 pr-10 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass({ ...showPass, new: !showPass.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    >
                      {showPass.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {passwords.new && (
                    <div className="pt-2 space-y-1 animate-fade-in">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-text-secondary uppercase">Kekuatan Sandi:</span>
                        <span className="text-text-primary">{pwdStrength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                        <div
                          className={`h-full ${pwdStrength.color} transition-all duration-300`}
                          style={{ width: `${pwdStrength.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-text-secondary uppercase text-[10px]">Konfirmasi Kata Sandi Baru *</label>
                  <div className="relative">
                    <input
                      type={showPass.confirm ? 'text' : 'password'}
                      required
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      placeholder="Ulangi kata sandi baru"
                      className="w-full rounded-xl border border-border bg-bg pl-3 pr-10 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    >
                      {showPass.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Session Card */}
              <div className="space-y-2 pt-2 border-t border-border">
                <h4 className="font-bold text-xs text-text-primary uppercase tracking-wider">Perangkat & Sesi Aktif</h4>
                <div className="p-3.5 rounded-xl bg-bg/40 border border-border flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Laptop className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="font-bold text-text-primary text-xs">Sesi Login Perangkat Saat Ini</p>
                      <p className="text-[10px] text-text-secondary">Terautentikasi via Token JWT • Terproteksi</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    Aktif
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end pt-4 border-t border-border">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex items-center space-x-2 rounded-2xl bg-primary hover:bg-primary-dark disabled:bg-primary/70 text-white px-6 py-2.5 font-bold shadow-lg shadow-primary/20 transition-all cursor-pointer hover:scale-[1.01]"
                >
                  {isChangingPassword ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Memperbarui...</span>
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4" />
                      <span>Perbarui Kata Sandi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB 3: KANAL NOTIFIKASI
             ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'notif' && (
            <div className="space-y-6 text-xs animate-fade-in">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-sm text-text-primary font-display flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <span>Kanal Notifikasi Email & System Alert</span>
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  {
                    key: 'weeklyReport',
                    title: 'Rekapitulasi Mingguan Progres BSAN',
                    desc: 'Kirimkan laporan rangkuman mingguan pengisian survei secara berkala.',
                  },
                  {
                    key: 'instantAlert',
                    title: 'Notifikasi Instan Observasi SEL',
                    desc: 'Notifikasi instan saat pengawas menyelesaikan sesi observasi lapangan SEL.',
                  },
                  {
                    key: 'reminderEmail',
                    title: 'Pengingat Otomatis Sekolah Belum Mengisi',
                    desc: 'Kirimkan email pengingat otomatis ke sekolah yang belum melengkapi kuisioner.',
                  },
                  {
                    key: 'systemUpdate',
                    title: 'Pengumuman Update & Pemeliharaan Sistem',
                    desc: 'Berita pembaruan fitur dashboard dan jadwal pemeliharaan server.',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start space-x-3 cursor-pointer p-3.5 rounded-xl bg-bg/40 border border-border/60 hover:border-border hover:bg-bg transition"
                  >
                    <input
                      type="checkbox"
                      checked={(notif as any)[item.key]}
                      onChange={(e) => setNotif({ ...notif, [item.key]: e.target.checked })}
                      className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <div>
                      <p className="font-bold text-text-primary">{item.title}</p>
                      <p className="text-[10px] text-text-secondary mt-0.5">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-end pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  disabled={isSaving}
                  className="flex items-center space-x-2 rounded-2xl bg-primary hover:bg-primary-dark disabled:bg-primary/70 text-white px-6 py-2.5 font-bold shadow-lg shadow-primary/20 transition-all cursor-pointer hover:scale-[1.01]"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Simpan Notifikasi</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB 4: PREFERENSI DASBOR
             ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'pref' && (
            <div className="space-y-6 text-xs animate-fade-in">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-sm text-text-primary font-display flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span>Tampilan Dasbor & Preferensi Penggunaan</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-text-secondary uppercase text-[10px]">Bahasa Antarmuka</label>
                  <CustomSelect
                    value={pref.language}
                    onChange={(val) => setPref({ ...pref, language: val })}
                    options={[
                      { value: 'id', label: 'Bahasa Indonesia (Default)' },
                      { value: 'en', label: 'English (US)' },
                    ]}
                    placeholder="Pilih Bahasa"
                    size="md"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-text-secondary uppercase text-[10px]">Tema Dasbor</label>
                  <CustomSelect
                    value={pref.theme}
                    onChange={(val) => setPref({ ...pref, theme: val })}
                    options={[
                      { value: 'light', label: 'Terang (Light Theme)' },
                      { value: 'dark', label: 'Gelap (Dark Theme)' },
                    ]}
                    placeholder="Pilih Tema"
                    size="md"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2 p-4 bg-bg/50 rounded-2xl border border-border">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-text-primary text-xs">Interval Simpan Draft Otomatis</span>
                    <span className="font-extrabold text-primary text-xs bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                      {pref.autoSaveInterval} Detik
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="5"
                    value={pref.autoSaveInterval}
                    onChange={(e) => setPref({ ...pref, autoSaveInterval: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <p className="text-[10px] text-text-secondary">
                    Interval simpan otomatis saat menginputkan survei & observasi SEL.
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-end pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  disabled={isSaving}
                  className="flex items-center space-x-2 rounded-2xl bg-primary hover:bg-primary-dark disabled:bg-primary/70 text-white px-6 py-2.5 font-bold shadow-lg shadow-primary/20 transition-all cursor-pointer hover:scale-[1.01]"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Simpan Preferensi</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
