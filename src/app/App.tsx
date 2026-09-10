import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isAuthenticated, clearToken } from '../shared/services/api-client';

// Shared Layout & UI Components
import Sidebar from '../shared/components/Sidebar';
import Topbar from '../shared/components/Topbar';
import ThreeDotsLoader from '../shared/components/ThreeDotsLoader';
import ThrottleToast from '../shared/components/ThrottleToast';
import NotificationToastContainer, { notifyToast } from '../shared/components/NotificationToast';

// Lazy Loaded Feature Pages
const Login = lazy(() => import('../features/auth/pages/LoginPage'));
const Dashboard = lazy(() => import('../features/dashboard/pages/DashboardPage'));
const KecamatanMap = lazy(() => import('../features/peta/pages/KecamatanMapPage'));
const Kuisioner = lazy(() => import('../features/kuisioner/pages/KuisionerPage'));
const DataResponden = lazy(() => import('../features/responden/pages/DataRespondenPage'));
const DataSatuanPendidikan = lazy(() => import('../features/sekolah/pages/DataSekolahPage'));
const ModulBsan = lazy(() => import('../features/analisis/pages/ModulBsanPage'));
const ProporsiModul = lazy(() => import('../features/analisis/pages/ProporsiModulPage'));
const GapFunnel = lazy(() => import('../features/analisis/pages/GapFunnelPage'));
const MatriksKuadran = lazy(() => import('../features/analisis/pages/MatriksKuadranPage'));
const TantanganImplementasi = lazy(() => import('../features/analisis/pages/TantanganPage'));
const ObservasiSEL = lazy(() => import('../features/sel/pages/ObservasiSELPage'));
const AnalisisSEL = lazy(() => import('../features/sel/pages/AnalisisSELPage'));
const KelolaFormSEL = lazy(() => import('../features/sel/pages/KelolaFormSELPage'));
const SuaraResponden = lazy(() => import('../features/suara/pages/SuaraRespondenPage'));
const LaporanEkspor = lazy(() => import('../features/laporan/pages/LaporanEksporPage'));
const Setting = lazy(() => import('../features/setting/pages/SettingPage'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 1000 * 60 * 5 } },
});

// A wrapper to handle the sidebar auto-close on navigation
function AppContent({
  userRole,
  sidebarOpen,
  setSidebarOpen,
  activeKecamatan,
  setActiveKecamatan,
  searchTerm,
  setSearchTerm,
  handleSwitchRole,
  handleLogout
}: any) {
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [setSidebarOpen]);

  return (
    <div className="flex h-screen bg-bg overflow-hidden font-sans text-text-primary antialiased">
      <NotificationToastContainer />
      <ThrottleToast />
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        userRole={userRole} 
        onLogout={handleLogout}
      />
      <div className="flex flex-col flex-1 min-w-0 transition-[padding] duration-300 lg:pl-[260px]">
        <Topbar 
          onMenuClick={() => setSidebarOpen(true)} 
          activeKecamatan={activeKecamatan}
          onClearKecamatan={() => setActiveKecamatan(null)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          userRole={userRole}
          onSwitchRole={handleSwitchRole}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto w-full">
            <Suspense fallback={<ThreeDotsLoader fullScreen={true} text="Memuat Halaman..." size="lg" />}>
              <Routes>
                {userRole === 'admin' ? (
                  <>
                    <Route path="/" element={<Dashboard activeKecamatan={activeKecamatan} setActiveKecamatan={setActiveKecamatan} userRole={userRole} />} />
                    <Route path="/map" element={<KecamatanMap />} />
                    <Route path="/kuisioner" element={<Kuisioner userRole={userRole} />} />
                    <Route path="/responden" element={<DataResponden activeKecamatan={activeKecamatan} setActiveKecamatan={setActiveKecamatan} searchTerm={searchTerm} onSearchChange={setSearchTerm} />} />
                    <Route path="/sekolah" element={<DataSatuanPendidikan userRole={userRole} />} />
                    <Route path="/modul" element={<ModulBsan />} />
                    <Route path="/proporsi" element={<ProporsiModul />} />
                    <Route path="/funnel" element={<GapFunnel activeKecamatan={activeKecamatan} />} />
                    <Route path="/matriks" element={<MatriksKuadran activeKecamatan={activeKecamatan} />} />
                    <Route path="/tantangan" element={<TantanganImplementasi activeKecamatan={activeKecamatan} />} />
                    <Route path="/suara" element={<SuaraResponden activeKecamatan={activeKecamatan} userRole={userRole} />} />
                    <Route path="/laporan" element={<LaporanEkspor />} />
                    <Route path="/observasi-sel" element={<ObservasiSEL userRole="admin" />} />
                    <Route path="/kelola-form-sel" element={<KelolaFormSEL />} />
                    <Route path="/analisis-sel" element={<AnalisisSEL />} />
                    <Route path="/setting" element={<Setting />} />
                    <Route path="*" element={<Dashboard activeKecamatan={activeKecamatan} setActiveKecamatan={setActiveKecamatan} userRole={userRole} />} />
                  </>
                ) : (
                  <>
                    <Route path="/" element={<Dashboard activeKecamatan={activeKecamatan} setActiveKecamatan={setActiveKecamatan} userRole={userRole} />} />
                    <Route path="/map" element={<KecamatanMap />} />
                    <Route path="/kuisioner" element={<Kuisioner userRole={userRole} />} />
                    <Route path="/sekolah" element={<DataSatuanPendidikan userRole={userRole} />} />
                    <Route path="/suara" element={<SuaraResponden activeKecamatan={activeKecamatan} userRole={userRole} />} />
                    <Route path="/observasi-sel" element={<ObservasiSEL userRole="pengawas" />} />
                    <Route path="/setting" element={<Setting />} />
                    <Route path="*" element={<Dashboard activeKecamatan={activeKecamatan} setActiveKecamatan={setActiveKecamatan} userRole={userRole} />} />
                  </>
                )}
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return isAuthenticated();
  });

  const [isAuthTransitioning, setIsAuthTransitioning] = useState(false);
  const [transitionText, setTransitionText] = useState('Memuat...');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeKecamatan, setActiveKecamatan] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [userRole, setUserRole] = useState<'admin' | 'pengawas'>(() => {
    const saved = localStorage.getItem('bsan_user_role');
    if (saved === 'admin' || saved === 'pengawas') return saved;
    return 'admin';
  });

  // Sync role dari token saat mount
  useEffect(() => {
    const token = localStorage.getItem('bsan_auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'admin' || payload.role === 'pengawas') {
          setUserRole(payload.role);
          localStorage.setItem('bsan_user_role', payload.role);
        }
      } catch {}
    }
  }, []);

  const handleSwitchRole = (role: 'admin' | 'pengawas') => {
    setUserRole(role);
    localStorage.setItem('bsan_user_role', role);
    notifyToast({
      type: 'info',
      title: 'Peran Diubah',
      message: `Akses aktif Anda sekarang adalah ${role.toUpperCase()}.`,
    });
  };

  const handleLogout = () => {
    setTransitionText('Mengakhiri Sesi & Keluar Account...');
    setIsAuthTransitioning(true);
    setTimeout(() => {
      clearToken();
      localStorage.removeItem('bsan_user_role');
      setIsLoggedIn(false);
      setIsAuthTransitioning(false);
      notifyToast({
        type: 'info',
        title: 'Logout Berhasil',
        message: 'Anda telah keluar dari akun.',
      });
    }, 1000);
  };

  const handleLogin = (user: any, role: 'admin' | 'pengawas') => {
    setTransitionText('Menyiapkan Dashboard & Autentikasi Account...');
    setIsAuthTransitioning(true);
    setTimeout(() => {
      setUserRole(role);
      setIsLoggedIn(true);
      localStorage.setItem('bsan_user_role', role);
      setIsAuthTransitioning(false);
      notifyToast({
        type: 'success',
        title: 'Login Berhasil!',
        message: `Selamat datang kembali, ${user?.nama || 'Pengguna'}!`,
      });
    }, 1000);
  };

  return (
    <>
      <ThrottleToast />
      {isAuthTransitioning && <ThreeDotsLoader fullScreen={true} text={transitionText} size="lg" />}
      {!isLoggedIn ? (
        <Suspense fallback={<ThreeDotsLoader fullScreen={true} text="Memuat Halaman Login..." />}>
          <Login onLogin={handleLogin} />
        </Suspense>
      ) : (
        <QueryClientProvider client={queryClient}>
          <Router>
            <AppContent 
              userRole={userRole}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              activeKecamatan={activeKecamatan}
              setActiveKecamatan={setActiveKecamatan}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleSwitchRole={handleSwitchRole}
              handleLogout={handleLogout}
            />
          </Router>
        </QueryClientProvider>
      )}
    </>
  );
}
