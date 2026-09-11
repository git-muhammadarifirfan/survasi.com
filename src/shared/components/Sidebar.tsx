import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Map, BookOpen, Users, School, BarChart3,
  Layers, Grid3X3, AlertTriangle, MessageSquare, FileSpreadsheet,
  Settings, LogOut, X, PieChart, Brain, ClipboardList, Shield
} from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import type { UserRole } from './RoleGuard';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  userRole: UserRole;
  onLogout: () => void;
}

export default function Sidebar({ isOpen, setIsOpen, userRole, onLogout }: SidebarProps) {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const adminGroups = [
    {
      title: 'RINGKASAN',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Peta Kecamatan', path: '/map', icon: Map },
      ],
    },
    {
      title: 'DATA & CRUD',
      items: [
        { name: 'Kelola User', path: '/users', icon: Shield, badge: 'Role' },
        { name: 'Kuisioner BSAN', path: '/kuisioner', icon: BookOpen },
        { name: 'Form Observasi', path: '/kelola-form-sel', icon: Settings, badge: 'CRUD' },
        { name: 'Data Observasi SEL', path: '/observasi-sel', icon: ClipboardList, badge: 'SEL' },
        { name: 'Data Responden', path: '/responden', icon: Users },
        { name: 'Data Satuan Pendidikan', path: '/sekolah', icon: School },
      ],
    },
    {
      title: 'ANALISIS',
      items: [
        { name: 'Analisis SEL', path: '/analisis-sel', icon: Brain, badge: 'Baru' },
        { name: 'Modul BSAN', path: '/modul', icon: BarChart3 },
        { name: 'Proporsi Modul', path: '/proporsi', icon: PieChart },
        { name: 'Analisis Gap Funnel', path: '/funnel', icon: Layers },
        { name: 'Matriks 4 Kuadran', path: '/matriks', icon: Grid3X3 },
        { name: 'Tantangan Implementasi', path: '/tantangan', icon: AlertTriangle },
      ],
    },
    {
      title: 'INSIGHT',
      items: [
        { name: 'Suara Responden', path: '/suara', icon: MessageSquare, badge: 'Fase 2' },
      ],
    },
    {
      title: 'LAPORAN',
      items: [
        { name: 'Laporan & Ekspor', path: '/laporan', icon: FileSpreadsheet },
      ],
    },
    {
      title: 'SISTEM',
      items: [
        { name: 'Setting', path: '/setting', icon: Settings },
      ],
    },
  ];

  const pengawasGroups = [
    {
      title: 'PENGAWAS',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Isi Observasi Lapangan', path: '/observasi-sel', icon: ClipboardList, badge: 'SEL' },
        { name: 'Data Observasi SEL', path: '/analisis-sel', icon: Brain },
        { name: 'Data Responden', path: '/responden', icon: Users },
        { name: 'Hasil Suara Responden', path: '/suara', icon: MessageSquare },
        { name: 'Peta Sekolah & Wilayah', path: '/map', icon: Map },
        { name: 'Profil & Data Sekolah', path: '/sekolah', icon: School },
        { name: 'Pengaturan', path: '/setting', icon: Settings },
      ],
    },
  ];


  const sekolahGroups = [
    {
      title: 'SEKOLAH',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Isi Kuisioner BSAN', path: '/kuisioner', icon: BookOpen },
        { name: 'Isi Suara Responden', path: '/suara', icon: MessageSquare, badge: 'Input' },
        { name: 'Profil & Data Sekolah', path: '/sekolah', icon: School },
        { name: 'Pengaturan Akun', path: '/setting', icon: Settings },
      ],
    },
  ];

  const menuGroups = userRole === 'admin' ? adminGroups : userRole === 'pengawas' ? pengawasGroups : sekolahGroups;

  const getRoleLabel = () => {
    switch (userRole) {
      case 'admin': return 'Admin Sistem';
      case 'pengawas': return 'Pengawas';
      case 'sekolah': return 'Sekolah';
      default: return 'User';
    }
  };

  const getRoleSubtext = () => {
    switch (userRole) {
      case 'admin': return 'Dinas Pendidikan Jatim';
      case 'pengawas': return 'Pengawas Sidoarjo';
      case 'sekolah': return 'Satuan Pendidikan';
      default: return 'Survasi Member';
    }
  };

  const getRoleAvatar = () => {
    switch (userRole) {
      case 'admin': return 'AD';
      case 'pengawas': return 'PS';
      case 'sekolah': return 'SK';
      default: return 'US';
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-surface border-r border-border shadow-soft transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-[72px] items-center justify-between px-5">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-85 transition-opacity">
            <img src="/bsan_logo.png" className="h-9 w-9 object-contain rounded-lg shadow-sm bg-white p-0.5" alt="BSAN Logo" />
            <div className="leading-tight">
              <h1 className="text-[15px] font-bold font-display text-text-primary tracking-tight">Survey BSAN</h1>
              <p className="text-[10px] font-medium text-text-secondary">Dashboard Jawa Timur</p>
            </div>
          </Link>
          <button
            className="rounded-lg p-1.5 text-text-secondary hover:bg-bg lg:hidden cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-4 h-px bg-border" />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx}>
              <h3 className="mb-1.5 px-3 text-[10px] font-bold tracking-[0.08em] text-text-secondary/70 uppercase">
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const badge = (item as any).badge;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `group flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-primary text-white shadow-md shadow-primary/20 font-bold'
                            : 'text-text-secondary hover:bg-bg hover:text-text-primary'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center space-x-3">
                            <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-white' : 'text-text-secondary group-hover:text-primary'}`} />
                            <span>{item.name}</span>
                          </div>
                          {badge && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                              isActive ? 'bg-white/20 text-white' : 'bg-accent/10 text-accent'
                            }`}>
                              {badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User profile + Logout */}
        <div className="border-t border-border p-3">
          <div className="flex items-center space-x-3 rounded-xl bg-bg p-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white text-xs font-bold shrink-0">
              {getRoleAvatar()}
            </div>
            <div className="leading-tight overflow-hidden">
              <p className="text-xs font-semibold text-text-primary truncate">
                {getRoleLabel()}
              </p>
              <p className="text-[10px] text-text-secondary truncate">
                {getRoleSubtext()}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex w-full items-center space-x-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-status-belum hover:bg-status-belum/5 transition-smooth cursor-pointer"
          >
            <LogOut className="h-[18px] w-[18px]" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* Confirmation Modal for Logout */}
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          onLogout();
        }}
        title="Keluar dari Aplikasi"
        description="Apakah Anda yakin ingin mengakhiri sesi login? Anda perlu memasukkan kredensial lagi untuk masuk."
        confirmLabel="Ya, Keluar Akun"
        cancelLabel="Batal"
        variant="danger"
        icon={LogOut}
      />
    </>
  );
}
