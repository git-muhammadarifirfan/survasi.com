import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu, Bell, Search, User, X,
  LogOut, Settings, CheckCheck,
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

const NOTIF_LIMIT = 5;

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
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bsan_user_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserName(parsed.nama || '');
      }
    } catch {}
  }, []);

  const fetchNotifications = useCallback(() => {
    apiClient.notifikasi.getAll()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setNotifications(res.data);
          setUnreadCount(res.unread_count || 0);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markRead = async (id: number) => {
    const notif = notifications.find(n => n.id === id);
    if (!notif || notif.is_read) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try { await apiClient.notifikasi.markRead(id); } catch {}
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      await apiClient.setting.markAllRead();
    } catch {}
  };

  const getRoleBadge = () => {
    switch (userRole) {
      case 'admin': return { label: 'Admin Sistem', color: 'bg-teal-500/10 text-teal-700 border-teal-200' };
      case 'pengawas': return { label: 'Pengawas Sekolah', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' };
      case 'sekolah': return { label: 'Perwakilan Sekolah', color: 'bg-amber-500/10 text-amber-600 border-amber-200' };
      default: return { label: 'User', color: 'bg-slate-500/10 text-slate-600 border-slate-200' };
    }
  };

  const badge = getRoleBadge();
  const visibleNotifs = notifications.slice(0, NOTIF_LIMIT);
  const hasMore = notifications.length > NOTIF_LIMIT;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-topbar-dropdown]')) {
        setShowNotif(false);
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

      {/* Right: Search, Notifications, Profile */}
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

        {/* Notification Icon */}
        <div className="relative" data-topbar-dropdown>
          <button
            onClick={() => {
              setShowNotif(!showNotif);
              setShowProfile(false);
            }}
            className="relative rounded-xl p-2.5 text-text-secondary hover:bg-bg hover:text-text-primary transition-smooth cursor-pointer"
            title="Notifikasi"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl bg-surface p-4 shadow-2xl border border-border space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="font-bold text-text-primary text-sm flex items-center space-x-1.5">
                  <Bell className="h-4 w-4 text-accent" />
                  <span>Notifikasi</span>
                  {unreadCount > 0 && <span className="ml-1 text-[10px] font-bold text-accent">({unreadCount})</span>}
                </span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer">
                      <CheckCheck className="h-3 w-3" /> Tandai semua dibaca
                    </button>
                  )}
                  <button onClick={() => setShowNotif(false)} className="text-text-secondary hover:text-text-primary cursor-pointer">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                {visibleNotifs.length === 0 ? (
                  <p className="text-center text-text-secondary py-6">Belum ada notifikasi.</p>
                ) : (
                  visibleNotifs.map(n => (
                    <button key={n.id} type="button" onClick={() => markRead(n.id)}
                      className={`w-full text-left p-2.5 rounded-xl border space-y-1 transition cursor-pointer ${!n.is_read ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' : 'bg-bg/60 border-border/40 hover:bg-bg'}`}>
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-text-primary text-xs leading-snug">{n.judul}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!n.is_read && <span className="h-2 w-2 rounded-full bg-accent" />}
                          <span className="text-[9px] text-text-secondary whitespace-nowrap">
                            {n.created_at ? new Date(n.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''}
                          </span>
                        </div>
                      </div>
                      <p className="text-text-secondary text-[11px] leading-snug line-clamp-2">{n.pesan}</p>
                    </button>
                  ))
                )}
              </div>
              {(hasMore || notifications.length > 0) && (
                <button
                  onClick={() => { setShowNotif(false); navigate('/setting'); }}
                  className="w-full text-center text-xs font-bold text-primary hover:underline py-1.5 cursor-pointer"
                >
                  Lihat Semua Notifikasi
                </button>
              )}
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-border mx-1" />

        {/* Profile Card */}
        <div className="relative" data-topbar-dropdown>
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotif(false);
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
