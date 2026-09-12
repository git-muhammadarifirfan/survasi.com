import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu, Bell, Search, User, X, Mail,
  LogOut, Settings
} from 'lucide-react';
import { apiClient } from '../services/api-client';

export type UserRole = 'admin' | 'pengawas' | 'sekolah';

interface TopbarProps {
  onMenuClick: () => void;
  activeKecamatan: string | null;
  onClearKecamatan: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  userRole: UserRole;
  onLogout: () => void;
}

export default function Topbar({
  onMenuClick,
  activeKecamatan,
  onClearKecamatan,
  searchTerm,
  onSearchChange,
  userRole,
  onLogout,
}: TopbarProps) {
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userName, setUserName] = useState('');

  // Load user name from stored profile
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bsan_user_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserName(parsed.nama || '');
      }
    } catch {}
  }, []);

  // Fetch real notifications from API
  useEffect(() => {
    apiClient.notifikasi.getAll()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setNotifications(res.data);
          setUnreadCount(res.unread_count || 0);
        }
      })
      .catch(() => {
        setNotifications([
          { id: 1, judul: 'Selamat Datang di Survasi BSAN', pesan: 'Sistem monitoring & evaluasi mutu pendidikan Jatim', tipe: 'system', is_read: false, created_at: new Date().toISOString() }
        ]);
      });
  }, [showNotif]);

  const messages = [
    { id: 1, sender: 'Dinas Pendidikan Jatim', text: 'Batas akhir pengisian survei BSAN tahap ini adalah tanggal 30 September 2026.', time: '09:00 WIB' },
    { id: 2, sender: 'Tim Evaluasi BSAN', text: 'Instruksi modul SEL & instrumen observasi sekolah sudah terdistribusi.', time: 'Kemarin' },
  ];

  const getRoleBadge = () => {
    switch (userRole) {
      case 'admin': return { label: 'Admin Sistem', color: 'bg-teal-500/10 text-teal-700 border-teal-200' };
      case 'pengawas': return { label: 'Pengawas Sekolah', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' };
      case 'sekolah': return { label: 'Perwakilan Sekolah', color: 'bg-amber-500/10 text-amber-600 border-amber-200' };
      default: return { label: 'User', color: 'bg-slate-500/10 text-slate-600 border-slate-200' };
    }
  };

  const badge = getRoleBadge();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-topbar-dropdown]')) {
        setShowNotif(false);
        setShowMessages(false);
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <span className="mx-2 text-text-secondary/40">/</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.color}`}>
            {badge.label}
          </span>

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

        {/* Message Icon */}
        <div className="relative" data-topbar-dropdown>
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
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-status-belum animate-ping" />
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
              <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar">
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

        {/* Notification Icon */}
        <div className="relative" data-topbar-dropdown>
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
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl bg-surface p-4 shadow-2xl border border-border space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="font-bold text-text-primary text-sm flex items-center space-x-1.5">
                  <Bell className="h-4 w-4 text-accent" />
                  <span>Notifikasi System</span>
                </span>
                <button onClick={() => setShowNotif(false)} className="text-text-secondary hover:text-text-primary">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <p className="text-center text-text-secondary py-4">Belum ada notifikasi baru.</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`p-2.5 rounded-xl border space-y-1 ${!n.is_read ? 'bg-primary/5 border-primary/20' : 'bg-bg/60 border-border/40'}`}>
                      <div className="flex justify-between font-bold text-text-primary">
                        <span>{n.judul}</span>
                        <span className="text-[9px] text-text-secondary">
                          {n.created_at ? new Date(n.created_at).toLocaleDateString('id-ID') : 'Baru'}
                        </span>
                      </div>
                      <p className="text-text-secondary text-[11px] leading-snug">{n.pesan}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-border mx-1" />

        {/* Profile Card — No Role Switcher */}
        <div className="relative" data-topbar-dropdown>
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotif(false);
              setShowMessages(false);
            }}
            className="flex items-center space-x-3 cursor-pointer rounded-xl px-2 py-1.5 hover:bg-bg transition-smooth"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white text-xs font-bold shadow-sm">
              {userName ? userName.substring(0, 1).toUpperCase() : <User className="h-4 w-4" />}
            </div>
            <div className="hidden lg:block text-left leading-tight">
              <p className="text-[13px] font-semibold text-text-primary truncate max-w-[140px]">
                {userName || badge.label}
              </p>
              <p className="text-[10px] font-medium text-text-secondary capitalize">
                {badge.label}
              </p>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl bg-surface p-4 shadow-2xl border border-border space-y-3 text-xs">
              {/* User Info Header */}
              <div className="border-b border-border pb-3 space-y-1">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white text-sm font-bold shadow-sm shrink-0">
                    {userName ? userName.substring(0, 1).toUpperCase() : <User className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-text-primary text-sm truncate">
                      {userName || badge.label}
                    </p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.color} capitalize`}>
                      {badge.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Actions */}
              <button
                onClick={() => {
                  setShowProfile(false);
                  navigate('/setting');
                }}
                className="w-full flex items-center space-x-2 p-2.5 rounded-xl text-text-primary hover:bg-bg font-semibold transition-smooth cursor-pointer"
              >
                <Settings className="h-4 w-4 text-text-secondary" />
                <span>Pengaturan Akun</span>
              </button>

              <button
                onClick={() => {
                  setShowProfile(false);
                  onLogout();
                }}
                className="w-full flex items-center space-x-2 p-2.5 rounded-xl text-status-belum hover:bg-status-belum/8 font-bold transition-smooth cursor-pointer"
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
