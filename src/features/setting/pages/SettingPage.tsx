/**
 * @module features/setting/pages
 * @description Pengaturan profil, notifikasi, preferensi, keamanan, user management
 * @tables users, user_preferences, notifikasi, activity_log
 * @queries database/queries/setting.sql → semua query
 * @api PUT /api/users/profile, PUT /api/users/preferences, GET /api/notifikasi
 */

import { useState, useEffect } from 'react';
import { Save, CheckCircle2, User, Bell, Shield, Settings, Key, Globe, Eye, EyeOff } from 'lucide-react';
import CustomSelect from '../../../shared/components/CustomSelect';

export default function Setting() {
  const [userRole, setUserRole] = useState<'admin' | 'pengawas'>('admin');
  const [activeTab, setActiveTab] = useState<'profile' | 'notif' | 'pref' | 'security'>('profile');
  const [showToast, setShowToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [profile, setProfile] = useState({
    nama: '',
    email: '',
    phone: '',
    instansi: '',
    jabatan: '',
  });

  const [notif, setNotif] = useState({
    weeklyReport: true,
    instantAlert: true,
    reminderEmail: false,
    systemUpdate: true,
  });

  const [pref, setPref] = useState({
    language: 'id',
    theme: 'light',
    autoSaveInterval: 30,
  });

  const [passwords, setPasswords] = useState({
    old: '',
    new: '',
    confirm: '',
  });
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });

  // Load configuration
  useEffect(() => {
    const role = (localStorage.getItem('bsan_user_role') as 'admin' | 'pengawas') || 'admin';
    setUserRole(role);

    if (role === 'admin') {
      setProfile({
        nama: 'Ahmad Muzaki, M.Pd.',
        email: 'admin@sidoarjo.go.id',
        phone: '0812-3456-7890',
        jabatan: 'Kepala Seksi Evaluasi Penjamin Mutu',
        instansi: 'Dinas Pendidikan Provinsi Jawa Timur',
      });
    } else {
      setProfile({
        nama: 'Dra. Endang Sri Rahayu, M.M.',
        email: 'pengawas@sch.id',
        phone: '0857-1234-5678',
        jabatan: 'Pengawas Sekolah / Penilik',
        instansi: 'Dinas Pendidikan Kab. Sidoarjo',
      });
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      setShowToast('Pengaturan berhasil disimpan');
      setTimeout(() => setShowToast(null), 3000);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 rounded-xl bg-status-sudah text-white px-4 py-3 shadow-xl text-xs font-semibold animate-scale-in">
          <CheckCircle2 className="h-4 w-4" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="rounded-card bg-surface p-6 shadow-card border border-border">
        <h2 className="text-xl font-bold text-text-primary font-display mb-1">Pengaturan Akun & Sistem</h2>
        <p className="text-xs text-text-secondary">Konfigurasi profile dinas, notifikasi email, preferensi dashboard, dan keamanan.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Tabs Navigation */}
        <div className="lg:col-span-1 rounded-card bg-surface p-4 shadow-card border border-border space-y-1.5 h-fit">
          {[
            { id: 'profile', label: 'Profil Pengguna', icon: User },
            { id: 'notif', label: 'Notifikasi Email', icon: Bell },
            { id: 'pref', label: 'Preferensi Dashboard', icon: Settings },
            { id: 'security', label: 'Keamanan Sandi', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition-smooth ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/10'
                    : 'text-text-secondary hover:bg-bg hover:text-text-primary'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Tab Contents */}
        <div className="lg:col-span-3 rounded-card bg-surface p-6 shadow-card border border-border">
          <form onSubmit={handleSave} className="space-y-6 text-xs">
            {/* 1. Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-text-primary border-b border-border pb-3 flex items-center space-x-2">
                  <User className="h-4 w-4 text-primary" />
                  <span>Informasi Identitas Diri</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-text-secondary uppercase">Nama Lengkap</label>
                    <input
                      type="text" required
                      value={profile.nama}
                      onChange={(e) => setProfile({ ...profile, nama: e.target.value })}
                      className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-text-secondary uppercase">Alamat Email</label>
                    <input
                      type="email" required
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-text-secondary uppercase">Nomor Telepon</label>
                    <input
                      type="text" required
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-text-secondary uppercase">Jabatan / Peran</label>
                    <input
                      type="text" required
                      value={profile.jabatan}
                      onChange={(e) => setProfile({ ...profile, jabatan: e.target.value })}
                      className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-text-secondary uppercase">Nama Instansi</label>
                    <input
                      type="text" required
                      disabled
                      value={profile.instansi}
                      className="w-full rounded-xl border border-border bg-border/40 px-3 py-2.5 text-text-secondary cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Notifications Tab */}
            {activeTab === 'notif' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-text-primary border-b border-border pb-3 flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <span>Kanal Notifikasi Langsung</span>
                </h3>
                <div className="space-y-4">
                  <label className="flex items-start space-x-3 cursor-pointer group p-3 rounded-xl hover:bg-bg/40 border border-transparent hover:border-border transition-smooth">
                    <input
                      type="checkbox"
                      checked={notif.weeklyReport}
                      onChange={(e) => setNotif({ ...notif, weeklyReport: e.target.checked })}
                      className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                    />
                    <div>
                      <p className="font-bold text-text-primary group-hover:text-primary transition-colors">Rekapitulasi Mingguan</p>
                      <p className="text-[10px] text-text-secondary">Kirim rangkuman progres target survei wilayah atau sekolah setiap Senin pagi.</p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer group p-3 rounded-xl hover:bg-bg/40 border border-transparent hover:border-border transition-smooth">
                    <input
                      type="checkbox"
                      checked={notif.instantAlert}
                      onChange={(e) => setNotif({ ...notif, instantAlert: e.target.checked })}
                      className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                    />
                    <div>
                      <p className="font-bold text-text-primary group-hover:text-primary transition-colors">Laporan Instan Pengisian</p>
                      <p className="text-[10px] text-text-secondary">Kirim notifikasi ke email setiap kali sekolah merampungkan pengisian modul kuesioner.</p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer group p-3 rounded-xl hover:bg-bg/40 border border-transparent hover:border-border transition-smooth">
                    <input
                      type="checkbox"
                      checked={notif.reminderEmail}
                      onChange={(e) => setNotif({ ...notif, reminderEmail: e.target.checked })}
                      className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                    />
                    <div>
                      <p className="font-bold text-text-primary group-hover:text-primary transition-colors">Reminder Otomatis Pengisian</p>
                      <p className="text-[10px] text-text-secondary">Izinkan sistem mengirim email pengingat mingguan ke sekolah yang berstatus belum mengisi.</p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer group p-3 rounded-xl hover:bg-bg/40 border border-transparent hover:border-border transition-smooth">
                    <input
                      type="checkbox"
                      checked={notif.systemUpdate}
                      onChange={(e) => setNotif({ ...notif, systemUpdate: e.target.checked })}
                      className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                    />
                    <div>
                      <p className="font-bold text-text-primary group-hover:text-primary transition-colors">Update Fitur & Aplikasi</p>
                      <p className="text-[10px] text-text-secondary">Dapatkan berita perilisan update modul terbaru, integrasi wilayah, dan peningkatan dashboard.</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* 3. Preferences Tab */}
            {activeTab === 'pref' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-text-primary border-b border-border pb-3 flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span>Bahasa & Preferensi Tampilan</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-text-secondary uppercase">Bahasa Pengantar</label>
                    <CustomSelect
                      value={pref.language}
                      onChange={(val) => setPref({ ...pref, language: val })}
                      options={[
                        { value: 'id', label: 'Bahasa Indonesia' },
                        { value: 'en', label: 'English (US)' },
                      ]}
                      placeholder="Pilih Bahasa"
                      size="md"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-text-secondary uppercase">Tema Dasbor</label>
                    <CustomSelect
                      value={pref.theme}
                      onChange={(val) => setPref({ ...pref, theme: val })}
                      options={[
                        { value: 'light', label: 'Terang (Default Light)' },
                        { value: 'dark', label: 'Gelap (Dark Mode)' },
                      ]}
                      placeholder="Pilih Tema"
                      size="md"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-2 p-3 bg-bg/40 rounded-xl border border-border/50">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-text-primary">Simpan Draft Otomatis</span>
                      <span className="font-bold text-primary">{pref.autoSaveInterval} detik</span>
                    </div>
                    <input
                      type="range" min="10" max="120" step="5"
                      value={pref.autoSaveInterval}
                      onChange={(e) => setPref({ ...pref, autoSaveInterval: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <p className="text-[10px] text-text-secondary">Waktu interval penyimpanan draft jawaban ketika Anda menginput kuisioner modul BSAN.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-text-primary border-b border-border pb-3 flex items-center space-x-2">
                  <Key className="h-4 w-4 text-primary" />
                  <span>Perubahan Kata Sandi Keamanan</span>
                </h3>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-1">
                    <label className="font-bold text-text-secondary uppercase">Kata Sandi Lama</label>
                    <div className="relative">
                      <input
                        type={showPass.old ? 'text' : 'password'}
                        value={passwords.old}
                        onChange={(e) => setPasswords({ ...passwords, old: e.target.value })}
                        placeholder="Masukkan sandi saat ini"
                        className="w-full rounded-xl border border-border bg-bg pl-3 pr-10 py-2.5 text-text-primary focus:border-primary focus:outline-none"
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
                    <label className="font-bold text-text-secondary uppercase">Kata Sandi Baru</label>
                    <div className="relative">
                      <input
                        type={showPass.new ? 'text' : 'password'}
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                        placeholder="Minimal 6 karakter"
                        className="w-full rounded-xl border border-border bg-bg pl-3 pr-10 py-2.5 text-text-primary focus:border-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass({ ...showPass, new: !showPass.new })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                      >
                        {showPass.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-text-secondary uppercase">Konfirmasi Sandi Baru</label>
                    <div className="relative">
                      <input
                        type={showPass.confirm ? 'text' : 'password'}
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        placeholder="Ulangi sandi baru"
                        className="w-full rounded-xl border border-border bg-bg pl-3 pr-10 py-2.5 text-text-primary focus:border-primary focus:outline-none"
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
              </div>
            )}

            {/* Form Action Footer */}
            <div className="flex justify-end pt-4 border-t border-border">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center space-x-2 rounded-xl bg-primary hover:bg-primary-dark disabled:bg-primary/75 text-white px-5 py-2.5 font-bold shadow-sm transition-smooth hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
