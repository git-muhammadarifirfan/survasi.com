import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu, Bell, Search, User, X, Mail, CheckCircle2, AlertCircle,
  Clock, ShieldCheck, LogOut, ArrowRight, RefreshCw, Sparkles
} from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
  activeKecamatan: string | null;
  onClearKecamatan: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  userRole: 'admin' | 'pengawas';
  onSwitchRole: (role: 'admin' | 'pengawas') => void;
  onLogout: () => void;
}

export default function Topbar({
  onMenuClick,
  activeKecamatan,
  onClearKecamatan,
  searchTerm,
  onSearchChange,
  userRole,
  onSwitchRole,
  onLogout,
}: TopbarProps) {
  const [showNotif, setShowNotif] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    { id: 1, title: 'SDN Candi 1 Menyelesaikan Survei', desc: 'Modul 1-3 terverifikasi lengkap', time: '10 min lalu', unread: true },
    { id: 2, title: 'Reminder Terkirim', desc: 'Surat pengingat terkirim ke 5 sekolah di Kec. Waru', time: '1 jam lalu', unread: true },
    { id: 3, title: 'Update Master Data', desc: '81 sekolah Kota Batu berhasil diperbarui', time: '3 jam lalu', unread: false },
  ];

  const messages = [
    { id: 1, sender: 'Dinas Pendidikan Sidoarjo', text: 'Batas akhir pengisian survei diperpanjang hingga 10 September 2026.', time: '09:00 WIB' },
    { id: 2, sender: 'Tim Evaluasi BSAN', text: 'Jadwal bimbingan teknis KKG bulan depan sudah dirilis.', time: 'Kemarin' },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-border bg-surface px-5 md:px-8">
      {/* Left: Hamburger + Breadcrumb */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 hover:bg-bg lg:hidden text-text-secondary cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden md:flex items-center text-sm">
          <Link to="/" className="font-semibold text-text-primary hover:text-primary transition-colors">Survei BSAN Jatim</Link>
          {activeKecamatan && (
            <>
              <span className="mx-2 text-text-secondary/50">/</span>
              <div className="inline-flex items-center space-x-1.5 rounded-full bg-primary/8 border border-primary/15 px-3 py-1">
                <span className="text-xs font-semibold text-primary">{activeKecamatan}</span>
                <button
                  onClick={onClearKecamatan}
                  className="rounded-full p-0.5 hover:bg-primary/10 text-primary/60 hover:text-primary cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Search, Notifications, Messages, Profile */}
      <div className="flex items-center space-x-3 relative">
        {/* Search */}
        <div className="relative hidden md:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-secondary">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Cari sekolah / NPSN..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-56 lg:w-72 rounded-xl border border-border bg-bg/60 py-2 pl-9 pr-8 text-sm text-text-primary placeholder-text-secondary/60 focus:border-primary/40 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/10 transition-smooth"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Message Icon & Floating Drawer */}
        <div className="relative">
          <button
            onClick={() => {
              setShowMessages(!showMessages);
              setShowNotif(false);
              setShowProfile(false);
            }}
            className="relative rounded-xl p-2.5 text-text-secondary hover:bg-bg hover:text-text-primary transition-smooth cursor-pointer"
            title="Pesan & Pengumuman"
          >
            <Mail className="h-[18px] w-[18px]" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-status-belum" />
          </button>

          {showMessages && (
            <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl bg-surface p-4 shadow-2xl border border-border space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="font-bold text-text-primary text-sm flex items-center space-x-1.5">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>Pengumuman & Pesan</span>
                </span>
                <button onClick={() => setShowMessages(false)} className="text-text-secondary hover:text-text-primary">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {messages.map(m => (
                  <div key={m.id} className="p-2.5 rounded-xl bg-bg/60 border border-border/40 space-y-1">
                    <div className="flex justify-between font-bold text-text-primary">
                      <span>{m.sender}</span>
                      <span className="text-[10px] text-text-secondary">{m.time}</span>
                    </div>
                    <p className="text-text-secondary leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notification Icon & Floating Modal */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotif(!showNotif);
              setShowMessages(false);
              setShowProfile(false);
            }}
            className="relative rounded-xl p-2.5 text-text-secondary hover:bg-bg hover:text-text-primary transition-smooth cursor-pointer"
            title="Notifikasi Aktivitas"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent" />
          </button>

          {showNotif && (
            <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl bg-surface p-4 shadow-2xl border border-border space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="font-bold text-text-primary text-sm flex items-center space-x-1.5">
                  <Bell className="h-4 w-4 text-accent" />
                  <span>Notifikasi Sistem</span>
                </span>
                <button onClick={() => setShowNotif(false)} className="text-text-secondary hover:text-text-primary">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={`p-2.5 rounded-xl border space-y-1 ${n.unread ? 'bg-primary/5 border-primary/20' : 'bg-bg/60 border-border/40'}`}>
                    <div className="flex justify-between font-bold text-text-primary">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-text-secondary">{n.time}</span>
                    </div>
                    <p className="text-text-secondary">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-border mx-1" />

        {/* Profile Card & Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotif(false);
              setShowMessages(false);
            }}
            className="flex items-center space-x-3 cursor-pointer rounded-xl px-2 py-1.5 hover:bg-bg transition-smooth"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white text-xs font-bold shadow-sm">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden lg:block text-left leading-tight">
              <p className="text-[13px] font-semibold text-text-primary">
                {userRole === 'admin' ? 'Admin CRUD & Analisa' : 'Pengawas Sekolah'}
              </p>
              <p className="text-[10px] text-text-secondary">
                {userRole === 'admin' ? 'Super Admin' : 'Pengawas Sidoarjo'}
              </p>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl bg-surface p-4 shadow-2xl border border-border space-y-3 text-xs">
              <div className="border-b border-border pb-2.5 space-y-0.5">
                <p className="font-bold text-text-primary text-sm">
                  {userRole === 'admin' ? 'Admin Dinas (CRUD & Analisa)' : 'Pengawas Sekolah (Input/Adjust DB)'}
                </p>
                <p className="text-[10px] text-text-secondary">
                  {userRole === 'admin' ? 'admin@sidoarjo.go.id' : 'pengawas@sch.id'}
                </p>
              </div>

              {/* Role Switcher Button */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-secondary uppercase">Ganti Peran Stakeholder:</p>
                <button
                  onClick={() => {
                    const newRole = userRole === 'admin' ? 'pengawas' : 'admin';
                    onSwitchRole(newRole);
                    setShowProfile(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-primary/8 hover:bg-primary/15 text-primary font-bold border border-primary/20 transition-smooth"
                >
                  <span className="flex items-center space-x-1.5">
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Ganti ke {userRole === 'admin' ? 'Pengawas Sekolah' : 'Admin'}</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                onClick={() => {
                  setShowProfile(false);
                  onLogout();
                }}
                className="w-full flex items-center space-x-2 p-2 rounded-xl text-status-belum hover:bg-status-belum/8 font-bold transition-smooth"
              >
                <LogOut className="h-4 w-4" />
                <span>Keluar Akun</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
