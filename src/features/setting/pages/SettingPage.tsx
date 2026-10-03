/**
 * @module features/setting/pages
 * @description Pengaturan akun — profil, keamanan (ganti sandi via OTP email),
 *   notifikasi, preferensi tampilan, dan target observasi SEL (khusus admin).
 * @api GET/PUT /api/setting/profile, GET/PUT /api/setting/preferences,
 *      POST /api/auth/forgot-password, POST /api/auth/reset-password,
 *      GET/PUT /api/setting/target-observasi(/batch)
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  User, Shield, Bell, SlidersHorizontal, Target, Save, Mail, Phone, Briefcase, Building2, MapPin,
  Eye, EyeOff, KeyRound, Send, ArrowLeft, Search, Minus, Plus, Loader2, CheckCircle2, Lock, Clock,
} from 'lucide-react';
import CustomSelect from '../../../shared/components/CustomSelect';
import { notifyToast } from '../../../shared/components/NotificationToast';
import { apiClient } from '../../../shared/services/api-client';

type TabId = 'profile' | 'security' | 'notif' | 'pref' | 'target';

interface TargetSchool {
  id: number;
  npsn: string;
  nama: string;
  target_observasi: number;
  kecamatan: string;
  kabupaten: string;
  observasi_count: number;
  _edited?: boolean;
}

const toBool = (v: unknown, fallback: boolean) => (v === undefined || v === null ? fallback : Boolean(Number(v)));

const ROLE_LABEL: Record<string, string> = { admin: 'Administrator', pengawas: 'Pengawas Sekolah', sekolah: 'Operator Sekolah' };

export default function Setting() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<TabId>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [account, setAccount] = useState<any>(null);
  const role: string = account?.role || 'pengawas';

  const [profile, setProfile] = useState({ nama: '', email: '', phone: '', instansi: '', jabatan: '' });
  const [notif, setNotif] = useState({ weeklyReport: true, instantAlert: true, reminderEmail: false, systemUpdate: true });
  const [pref, setPref] = useState({ language: 'id', theme: 'light', autoSaveInterval: 30 });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [p, pr] = await Promise.all([apiClient.setting.getProfile(), apiClient.setting.getPreferences()]);
        if (!alive) return;
        const d = p?.data || {};
        setAccount(d);
        setProfile({
          nama: d.nama || '',
          email: d.email || '',
          phone: d.phone || '',
          instansi: d.role === 'sekolah' ? (d.sekolah_nama || d.instansi || '') : (d.instansi || ''),
          jabatan: d.jabatan || '',
        });
        const x = pr?.data || {};
        setPref({ language: x.bahasa || 'id', theme: x.tema || 'light', autoSaveInterval: Number(x.auto_save_interval || 30) });
        setNotif({
          weeklyReport: toBool(x.notif_weekly_report, true),
          instantAlert: toBool(x.notif_instant_alert, true),
          reminderEmail: toBool(x.notif_reminder_email, false),
          systemUpdate: toBool(x.notif_system_update, true),
        });
      } catch (err: any) {
        notifyToast({ type: 'error', title: 'Gagal memuat', message: err?.message || 'Pengaturan akun tidak dapat dimuat.' });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.nama.trim()) {
      notifyToast({ type: 'warning', title: 'Nama wajib diisi', message: 'Nama tidak boleh kosong.' });
      return;
    }
    setSaving(true);
    try {
      const res = await apiClient.setting.updateProfile({ nama: profile.nama.trim(), phone: profile.phone, jabatan: profile.jabatan, instansi: profile.instansi });
      if (!res?.success) throw new Error(res?.message);
      const cached = JSON.parse(localStorage.getItem('bsan_user_profile') || '{}');
      localStorage.setItem('bsan_user_profile', JSON.stringify({ ...cached, ...profile, role }));
      qc.invalidateQueries({ queryKey: ['auth-me'] });
      notifyToast({ type: 'success', title: 'Profil disimpan', message: 'Perubahan profil tersimpan di database.' });
    } catch (err: any) {
      notifyToast({ type: 'error', title: 'Gagal menyimpan', message: err?.message || 'Terjadi kesalahan.' });
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async (label: string) => {
    setSaving(true);
    try {
      const res = await apiClient.setting.updatePreferences({
        bahasa: pref.language, tema: pref.theme, auto_save_interval: pref.autoSaveInterval,
        notif_weekly_report: notif.weeklyReport, notif_instant_alert: notif.instantAlert,
        notif_reminder_email: notif.reminderEmail, notif_system_update: notif.systemUpdate,
      });
      if (!res?.success) throw new Error();
      notifyToast({ type: 'success', title: `${label} disimpan`, message: 'Pengaturan berhasil diperbarui.' });
    } catch (err: any) {
      notifyToast({ type: 'error', title: 'Gagal menyimpan', message: err?.message || 'Pengaturan gagal disimpan.' });
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: TabId; label: string; desc: string; icon: typeof User }[] = [
    { id: 'profile', label: 'Profil', desc: 'Identitas akun', icon: User },
    { id: 'security', label: 'Keamanan', desc: 'Ganti kata sandi', icon: Shield },
    { id: 'notif', label: 'Notifikasi', desc: 'Email & pemberitahuan', icon: Bell },
    { id: 'pref', label: 'Preferensi', desc: 'Tampilan & draft', icon: SlidersHorizontal },
    ...(role === 'admin' ? [{ id: 'target' as TabId, label: 'Target Observasi', desc: 'Target sesi SEL per sekolah', icon: Target }] : []),
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] gap-3">
        <Loader2 className="h-7 w-7 text-primary animate-spin" />
        <p className="text-xs text-text-secondary">Memuat pengaturan akun…</p>
      </div>
    );
  }

  const initials = (profile.nama || profile.email || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="space-y-5 pb-10 animate-fade-in">
      {/* Kartu akun */}
      <div className="rounded-2xl bg-surface border border-border shadow-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-xl font-bold font-display shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-bold font-display text-text-primary truncate">{profile.nama || 'Pengguna'}</h1>
          <p className="text-xs text-text-secondary truncate">{profile.email}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">{ROLE_LABEL[role] || role}</span>
            {account?.sekolah_nama && <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-bg border border-border text-text-secondary">{account.sekolah_nama}</span>}
            {account?.last_login && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-bg border border-border text-text-secondary inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> Login terakhir {new Date(account.last_login).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Navigasi: pill horizontal di mobile, sidebar di desktop */}
        <nav className="lg:col-span-3">
          <div className="flex lg:flex-col gap-2 overflow-x-auto custom-scrollbar pb-1 lg:pb-0 lg:rounded-2xl lg:bg-surface lg:border lg:border-border lg:shadow-card lg:p-2">
            {tabs.map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`shrink-0 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition cursor-pointer border lg:border-0 ${
                    active ? 'bg-primary text-white border-primary shadow-sm' : 'bg-surface lg:bg-transparent text-text-secondary border-border hover:bg-bg hover:text-text-primary'
                  }`}>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>
                    <span className="block text-xs font-bold whitespace-nowrap">{t.label}</span>
                    <span className={`hidden lg:block text-[10px] ${active ? 'text-white/80' : 'text-text-secondary'}`}>{t.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="lg:col-span-9">
          {tab === 'profile' && (
            <Panel title="Profil Pengguna" desc="Informasi ini tampil di laporan dan sebagai nama pengisi/observer.">
              <form onSubmit={saveProfile} className="space-y-5">
                {role === 'sekolah' && account?.sekolah_nama && (
                  <div className="rounded-xl bg-bg border border-border p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <ReadItem icon={<Building2 className="h-4 w-4" />} label="Sekolah terdaftar" value={account.sekolah_nama} />
                    <ReadItem icon={<KeyRound className="h-4 w-4" />} label="NPSN" value={account.npsn || '-'} />
                    <ReadItem icon={<MapPin className="h-4 w-4" />} label="Wilayah" value={`${account.kecamatan_nama || '-'}, ${account.kabupaten_nama || '-'}`} />
                    <p className="sm:col-span-3 text-[11px] text-text-secondary flex items-center gap-1.5">
                      <Lock className="h-3 w-3" /> Data sekolah terkunci pada akun ini dan otomatis dipakai di form survei. Hubungi admin bila ada kekeliruan.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Nama lengkap" icon={<User className="h-4 w-4" />} required>
                    <input value={profile.nama} onChange={e => setProfile({ ...profile, nama: e.target.value })} className={inputCls} placeholder="Nama lengkap" />
                  </Field>
                  <Field label="Email (login)" icon={<Mail className="h-4 w-4" />} hint="Email tidak dapat diubah">
                    <input value={profile.email} disabled className={`${inputCls} bg-bg text-text-secondary cursor-not-allowed`} />
                  </Field>
                  <Field label="No. WhatsApp" icon={<Phone className="h-4 w-4" />}>
                    <input value={profile.phone} inputMode="tel" onChange={e => setProfile({ ...profile, phone: e.target.value.replace(/[^\d+\s-]/g, '') })} className={inputCls} placeholder="08xxxxxxxxxx" />
                  </Field>
                  <Field label="Jabatan" icon={<Briefcase className="h-4 w-4" />}>
                    <input value={profile.jabatan} onChange={e => setProfile({ ...profile, jabatan: e.target.value })} className={inputCls} placeholder={role === 'sekolah' ? 'Operator / Kepala Sekolah' : 'Jabatan'} />
                  </Field>
                  {role !== 'sekolah' && (
                    <Field label="Instansi" icon={<Building2 className="h-4 w-4" />} className="md:col-span-2">
                      <input value={profile.instansi} onChange={e => setProfile({ ...profile, instansi: e.target.value })} className={inputCls} placeholder="Nama instansi" />
                    </Field>
                  )}
                </div>
                <SaveBar saving={saving} label="Simpan Profil" submit />
              </form>
            </Panel>
          )}

          {tab === 'security' && <SecurityPanel email={profile.email} />}

          {tab === 'notif' && (
            <Panel title="Notifikasi" desc="Pilih pemberitahuan yang ingin Anda terima.">
              <div className="divide-y divide-border/60">
                <Toggle checked={notif.instantAlert} onChange={v => setNotif({ ...notif, instantAlert: v })}
                  title="Notifikasi instan" desc={role === 'admin' ? 'Saat sekolah selesai mengirim survei atau observasi baru masuk.' : 'Pemberitahuan langsung dari dinas di dalam aplikasi.'} />
                <Toggle checked={notif.reminderEmail} onChange={v => setNotif({ ...notif, reminderEmail: v })}
                  title="Email pengingat" desc={role === 'sekolah' ? 'Pengingat bila survei sekolah belum selesai.' : 'Pengingat tindak lanjut untuk sekolah yang belum mengisi.'} />
                <Toggle checked={notif.weeklyReport} onChange={v => setNotif({ ...notif, weeklyReport: v })}
                  title="Rekap mingguan" desc="Ringkasan progres pengisian & observasi setiap minggu via email." />
                <Toggle checked={notif.systemUpdate} onChange={v => setNotif({ ...notif, systemUpdate: v })}
                  title="Pembaruan sistem" desc="Informasi fitur baru dan pemeliharaan aplikasi." />
              </div>
              <SaveBar saving={saving} label="Simpan Notifikasi" onClick={() => savePreferences('Notifikasi')} />
            </Panel>
          )}

          {tab === 'pref' && (
            <Panel title="Preferensi" desc="Atur tampilan dan perilaku penyimpanan draft.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomSelect label="Bahasa" value={pref.language} onChange={v => setPref({ ...pref, language: v })}
                  options={[{ value: 'id', label: 'Bahasa Indonesia' }, { value: 'en', label: 'English' }]} />
                <CustomSelect label="Tema" value={pref.theme} onChange={v => setPref({ ...pref, theme: v })}
                  options={[{ value: 'light', label: 'Terang' }, { value: 'dark', label: 'Gelap' }]} />
                <div className="md:col-span-2 rounded-xl bg-bg border border-border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-text-primary">Interval simpan draft otomatis</p>
                      <p className="text-[11px] text-text-secondary">Seberapa sering draft form disimpan ke server (10–120 detik).</p>
                    </div>
                    <span className="text-lg font-black font-display text-primary tabular-nums">{pref.autoSaveInterval}s</span>
                  </div>
                  <input type="range" min={10} max={120} step={5} value={pref.autoSaveInterval}
                    onChange={e => setPref({ ...pref, autoSaveInterval: Number(e.target.value) })}
                    className="w-full mt-3 accent-[var(--color-primary)]" />
                </div>
              </div>
              <SaveBar saving={saving} label="Simpan Preferensi" onClick={() => savePreferences('Preferensi')} />
            </Panel>
          )}

          {tab === 'target' && role === 'admin' && <TargetPanel />}
        </div>
      </div>
    </div>
  );
}

// ─── Building blocks ─────────────────────────────────────────────────────────

const inputCls = 'w-full h-11 rounded-xl border border-border bg-surface pl-10 pr-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';

function Panel({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-surface border border-border shadow-card p-5 sm:p-6 animate-fade-in">
      <div className="mb-5 pb-4 border-b border-border">
        <h2 className="text-base font-bold font-display text-text-primary">{title}</h2>
        {desc && <p className="text-xs text-text-secondary mt-0.5">{desc}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, icon, children, hint, required, className = '' }: { label: string; icon: React.ReactNode; children: React.ReactNode; hint?: string; required?: boolean; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-semibold text-text-primary mb-1.5">{label}{required && <span className="text-status-belum ml-0.5">*</span>}</span>
      <span className="relative block">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">{icon}</span>
        {children}
      </span>
      {hint && <span className="block text-[10px] text-text-secondary mt-1">{hint}</span>}
    </label>
  );
}

function ReadItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <span className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-text-secondary font-semibold">{label}</p>
        <p className="text-xs font-bold text-text-primary truncate">{value}</p>
      </div>
    </div>
  );
}

function SaveBar({ saving, label, onClick, submit }: { saving: boolean; label: string; onClick?: () => void; submit?: boolean }) {
  return (
    <div className="flex justify-end pt-5 mt-5 border-t border-border">
      <button type={submit ? 'submit' : 'button'} onClick={onClick} disabled={saving}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-sm disabled:opacity-60 cursor-pointer">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {label}
      </button>
    </div>
  );
}

function Toggle({ checked, onChange, title, desc }: { checked: boolean; onChange: (v: boolean) => void; title: string; desc: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0">
      <div>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition cursor-pointer ${checked ? 'bg-primary' : 'bg-border'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

// ─── Keamanan: ganti sandi via OTP email ────────────────────────────────────

function strength(pwd: string) {
  let s = 0;
  if (pwd.length >= 6) s++;
  if (pwd.length >= 10) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9!@#$%^&*]/.test(pwd)) s++;
  return [
    { label: 'Kosong', color: 'bg-border', w: '0%' },
    { label: 'Lemah', color: 'bg-status-belum', w: '25%' },
    { label: 'Sedang', color: 'bg-status-sebagian', w: '50%' },
    { label: 'Bagus', color: 'bg-indigo-500', w: '75%' },
    { label: 'Sangat kuat', color: 'bg-status-sudah', w: '100%' },
  ][pwd ? Math.max(s, 1) : 0];
}

function SecurityPanel({ email }: { email: string }) {
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [otp, setOtp] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [timer, setTimer] = useState(0);
  const st = strength(pwd);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const requestOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (pwd.length < 6) return notifyToast({ type: 'warning', title: 'Sandi terlalu pendek', message: 'Minimal 6 karakter.' });
    if (pwd !== confirm) return notifyToast({ type: 'error', title: 'Tidak cocok', message: 'Konfirmasi kata sandi tidak sama.' });
    setBusy(true);
    try {
      const res = await apiClient.auth.forgotPassword({ email });
      if (!res?.success) throw new Error(res?.message);
      setStep('otp');
      setTimer(30);
      notifyToast({ type: 'info', title: 'Kode OTP dikirim', message: `Cek inbox/spam ${email}.` });
    } catch (err: any) {
      notifyToast({ type: 'error', title: 'Gagal mengirim OTP', message: err?.message || 'Coba lagi beberapa saat.' });
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length < 6) return notifyToast({ type: 'warning', title: 'Kode belum lengkap', message: 'Masukkan 6 digit kode OTP.' });
    setBusy(true);
    try {
      const res = await apiClient.auth.resetPassword({ email, otp_code: otp.trim(), new_password: pwd });
      if (!res?.success) throw new Error(res?.message);
      setStep('input'); setPwd(''); setConfirm(''); setOtp('');
      notifyToast({ type: 'success', title: 'Kata sandi diperbarui', message: 'Gunakan sandi baru saat login berikutnya.' });
    } catch (err: any) {
      notifyToast({ type: 'error', title: 'Verifikasi gagal', message: err?.message || 'Kode OTP salah atau kedaluwarsa.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title="Keamanan Akun" desc="Kata sandi diganti setelah verifikasi kode OTP yang dikirim ke email akun Anda.">
      <ol className="flex items-center gap-2 mb-6 text-[11px] font-bold">
        {['Buat sandi baru', 'Verifikasi OTP'].map((l, i) => {
          const active = (i === 0 && step === 'input') || (i === 1 && step === 'otp');
          const done = i === 0 && step === 'otp';
          return (
            <li key={l} className="flex items-center gap-2">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center ${done ? 'bg-status-sudah text-white' : active ? 'bg-primary text-white' : 'bg-bg border border-border text-text-secondary'}`}>
                {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className={active || done ? 'text-text-primary' : 'text-text-secondary'}>{l}</span>
              {i === 0 && <span className="w-8 h-px bg-border" />}
            </li>
          );
        })}
      </ol>

      {step === 'input' ? (
        <form onSubmit={requestOtp} className="space-y-4 max-w-md">
          <Field label="Kata sandi baru" icon={<Lock className="h-4 w-4" />} required>
            <input type={show ? 'text' : 'password'} value={pwd} onChange={e => setPwd(e.target.value)} className={`${inputCls} pr-10`} placeholder="Minimal 6 karakter" />
            <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary cursor-pointer">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </Field>
          <div>
            <div className="h-1.5 rounded-full bg-border/60 overflow-hidden"><div className={`h-full ${st.color} transition-all`} style={{ width: st.w }} /></div>
            <p className="text-[10px] text-text-secondary mt-1">Kekuatan: <strong>{st.label}</strong> — gunakan huruf besar, angka/simbol, dan ≥10 karakter.</p>
          </div>
          <Field label="Ulangi kata sandi" icon={<Lock className="h-4 w-4" />} required>
            <input type={show ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} className={inputCls} placeholder="Ketik ulang" />
          </Field>
          {confirm && pwd !== confirm && <p className="text-[11px] text-status-belum font-semibold">Konfirmasi belum sama.</p>}
          <button type="submit" disabled={busy} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark disabled:opacity-60 cursor-pointer">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Kirim kode OTP ke email
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-4 max-w-md">
          <p className="text-xs text-text-secondary">Kode 6 digit dikirim ke <strong className="text-text-primary">{email}</strong>.</p>
          <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoFocus
            className="w-full h-14 rounded-xl border border-border bg-surface text-center text-2xl font-black tracking-[0.6em] text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="••••••" />
          <div className="flex flex-col sm:flex-row gap-2">
            <button type="submit" disabled={busy} className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark disabled:opacity-60 cursor-pointer">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Verifikasi & simpan sandi
            </button>
            <button type="button" disabled={timer > 0 || busy} onClick={() => requestOtp()} className="h-11 px-4 rounded-xl bg-bg border border-border text-xs font-bold text-text-primary disabled:opacity-50 cursor-pointer">
              {timer > 0 ? `Kirim ulang (${timer}s)` : 'Kirim ulang kode'}
            </button>
          </div>
          <button type="button" onClick={() => setStep('input')} className="text-xs font-semibold text-text-secondary hover:text-text-primary inline-flex items-center gap-1 cursor-pointer">
            <ArrowLeft className="h-3.5 w-3.5" /> Ubah kata sandi
          </button>
        </form>
      )}
    </Panel>
  );
}

// ─── Target observasi (admin) ────────────────────────────────────────────────

function TargetPanel() {
  const [def, setDef] = useState(2);
  const [applyAll, setApplyAll] = useState(false);
  const [schools, setSchools] = useState<TargetSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 15;

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.setting.getTargetObservasi();
        setDef(res.data?.default_target || 2);
        setSchools((res.data?.schools || []).map((s: any) => ({
          id: s.id, npsn: s.npsn || '', nama: s.nama || '', target_observasi: Number(s.target_observasi || 2),
          kecamatan: s.kecamatan || '', kabupaten: s.kabupaten || '', observasi_count: Number(s.observasi_count || 0),
        })));
      } catch (err: any) {
        notifyToast({ type: 'error', title: 'Gagal memuat', message: err?.message || 'Data target tidak dapat dimuat.' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? schools.filter(s => s.nama.toLowerCase().includes(t) || s.npsn.includes(t) || s.kecamatan.toLowerCase().includes(t) || s.kabupaten.toLowerCase().includes(t)) : schools;
  }, [schools, q]);
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);
  const edited = schools.filter(s => s._edited);
  const tercapai = schools.filter(s => s.observasi_count >= s.target_observasi).length;

  const setTarget = (id: number, v: number) => setSchools(prev => prev.map(s => s.id === id ? { ...s, target_observasi: Math.min(Math.max(v, 1), 20), _edited: true } : s));

  const saveDefault = async () => {
    setSaving(true);
    try {
      const res = await apiClient.setting.updateTargetObservasi({ default_target: def, apply_to_all: applyAll });
      if (!res?.success) throw new Error(res?.message);
      if (applyAll) setSchools(prev => prev.map(s => ({ ...s, target_observasi: def, _edited: false })));
      notifyToast({ type: 'success', title: 'Target default disimpan', message: res.message });
    } catch (err: any) {
      notifyToast({ type: 'error', title: 'Gagal', message: err?.message || 'Target gagal disimpan.' });
    } finally {
      setSaving(false);
    }
  };

  const saveBatch = async () => {
    if (!edited.length) return;
    setSaving(true);
    try {
      const res = await apiClient.setting.updateTargetObservasiBatch(edited.map(s => ({ sekolah_id: s.id, target: s.target_observasi })));
      if (!res?.success) throw new Error(res?.message);
      setSchools(prev => prev.map(s => ({ ...s, _edited: false })));
      notifyToast({ type: 'success', title: 'Perubahan disimpan', message: res.message });
    } catch (err: any) {
      notifyToast({ type: 'error', title: 'Gagal', message: err?.message || 'Perubahan gagal disimpan.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel title="Target Observasi SEL" desc="Jumlah sesi observasi yang ditargetkan untuk setiap sekolah.">
      {loading ? <div className="py-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <Mini label="Sekolah" value={schools.length} />
            <Mini label="Target tercapai" value={tercapai} />
            <Mini label="Belum tercapai" value={schools.length - tercapai} />
          </div>

          <div className="rounded-xl bg-bg border border-border p-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-bold text-text-primary">Target default</p>
              <p className="text-[11px] text-text-secondary">Dipakai untuk sekolah baru. Centang untuk menerapkan ke seluruh sekolah.</p>
              <label className="mt-2 inline-flex items-center gap-2 text-xs text-text-primary cursor-pointer">
                <input type="checkbox" checked={applyAll} onChange={e => setApplyAll(e.target.checked)} className="h-4 w-4 accent-[var(--color-primary)]" />
                Terapkan ke semua sekolah
              </label>
            </div>
            <div className="flex items-center gap-3">
              <Stepper value={def} onChange={setDef} />
              <button onClick={saveDefault} disabled={saving} className="h-10 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark disabled:opacity-60 cursor-pointer">Simpan</button>
            </div>
          </div>

          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input value={q} onChange={e => { setQ(e.target.value); setPage(1); }} placeholder="Cari sekolah, NPSN, kecamatan…"
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <ul className="divide-y divide-border/60 rounded-xl border border-border">
            {rows.map(s => {
              const done = s.observasi_count >= s.target_observasi;
              return (
                <li key={s.id} className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 ${s._edited ? 'bg-primary/5' : ''}`}>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-text-primary truncate">{s.nama}</p>
                    <p className="text-[10px] text-text-secondary">NPSN {s.npsn} • {s.kecamatan}, {s.kabupaten}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${done ? 'bg-status-sudah/10 text-status-sudah' : 'bg-status-sebagian/10 text-status-sebagian'}`}>
                      {s.observasi_count}/{s.target_observasi} sesi
                    </span>
                    <Stepper value={s.target_observasi} onChange={v => setTarget(s.id, v)} small />
                  </div>
                </li>
              );
            })}
            {rows.length === 0 && <li className="p-6 text-center text-xs text-text-secondary">Tidak ada sekolah yang cocok.</li>}
          </ul>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 px-3 rounded-lg border border-border disabled:opacity-40 cursor-pointer">Sebelumnya</button>
              <span>{page} / {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="h-8 px-3 rounded-lg border border-border disabled:opacity-40 cursor-pointer">Berikutnya</button>
            </div>
            <button onClick={saveBatch} disabled={saving || !edited.length}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark disabled:opacity-50 cursor-pointer">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Simpan {edited.length ? `${edited.length} perubahan` : 'perubahan'}
            </button>
          </div>
        </div>
      )}
    </Panel>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-bg border border-border p-3 text-center">
      <p className="text-lg font-black font-display text-text-primary">{value.toLocaleString('id-ID')}</p>
      <p className="text-[10px] text-text-secondary">{label}</p>
    </div>
  );
}

function Stepper({ value, onChange, small }: { value: number; onChange: (v: number) => void; small?: boolean }) {
  const h = small ? 'h-8 w-8' : 'h-10 w-10';
  return (
    <div className="inline-flex items-center rounded-xl border border-border bg-surface overflow-hidden">
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} className={`${h} flex items-center justify-center hover:bg-bg cursor-pointer`}><Minus className="h-3.5 w-3.5" /></button>
      <span className={`${small ? 'w-8 text-xs' : 'w-10 text-sm'} text-center font-bold tabular-nums`}>{value}</span>
      <button type="button" onClick={() => onChange(Math.min(20, value + 1))} className={`${h} flex items-center justify-center hover:bg-bg cursor-pointer`}><Plus className="h-3.5 w-3.5" /></button>
    </div>
  );
}
