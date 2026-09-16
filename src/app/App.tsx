import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isAuthenticated, clearToken } from '../shared/services/api-client';

// Shared Layout & UI Components
import Sidebar from '../shared/components/Sidebar';
import Topbar from '../shared/components/Topbar';
import ThreeDotsLoader from '../shared/components/ThreeDotsLoader';
import ThrottleToast from '../shared/components/ThrottleToast';
import NotificationToastContainer, { notifyToast } from '../shared/components/NotificationToast';
import RoleGuard, { type UserRole } from '../shared/components/RoleGuard';
import { OfflineGlobalBanner } from '../shared/components/ConnectionErrorCard';


// Lazy Loaded Feature Pages
const Login = lazy(() => import('../features/auth/pages/LoginPage'));
const Dashboard = lazy(() => import('../features/dashboard/pages/DashboardPage'));
const KecamatanMap = lazy(() => import('../features/peta/pages/KecamatanMapPage'));
const Kuisioner = lazy(() => import('../features/kuisioner/pages/KuisionerPage'));
const DataResponden = lazy(() => import('../features/responden/pages/DataRespondenPage'));
const DataSatuanPendidikan = lazy(() => import('../features/sekolah/pages/DataSekolahPage'));
const SchoolProfilePage = lazy(() => import('../features/sekolah/pages/SchoolProfilePage'));
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
const UserManagementPage = lazy(() => import('../features/users/pages/UserManagementPage'));
const SurveyManagementPage = lazy(() => import('../features/survey/pages/SurveyManagementPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes fresh cache
      gcTime: 1000 * 60 * 15,    // 15 minutes garbage collection
      retry: 1,
    },
  },
});

function AppContent({
  userRole,
  sidebarOpen,
  setSidebarOpen,
  activeKecamatan,
  setActiveKecamatan,
  searchTerm,
  setSearchTerm,
  handleLogout
}: {
  userRole: UserRole;
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
  activeKecamatan: string | null;
  setActiveKecamatan: (val: string | null) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  handleLogout: () => void;
}) {
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [setSidebarOpen]);

  return (
    <div className="flex h-screen bg-bg overflow-hidden font-sans text-text-primary antialiased">
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
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto w-full">
            <Suspense fallback={<ThreeDotsLoader fullScreen={true} text="Memuat Halaman..." size="lg" />}>
              <Routes>
                {/* Public / Common Routes accessible by all 3 roles */}
                <Route path="/" element={<Dashboard activeKecamatan={activeKecamatan} setActiveKecamatan={setActiveKecamatan} userRole={userRole} />} />
                <Route path="/map" element={<KecamatanMap />} />
                <Route path="/sekolah" element={<DataSatuanPendidikan userRole={userRole} />} />
                <Route path="/sekolah/detail/:id" element={<SchoolProfilePage userRole={userRole} />} />
                <Route path="/sekolah/:id" element={<SchoolProfilePage userRole={userRole} />} />
                <Route path="/profil-sekolah/:id" element={<SchoolProfilePage userRole={userRole} />} />
                <Route path="/suara" element={<SuaraResponden activeKecamatan={activeKecamatan} userRole={userRole} />} />
                <Route path="/setting" element={<Setting />} />

                {/* Admin Only Routes */}
                <Route path="/users" element={<RoleGuard userRole={userRole} allowedRoles={['admin']}><UserManagementPage /></RoleGuard>} />
                <Route path="/kelola-form-sel" element={<RoleGuard userRole={userRole} allowedRoles={['admin']}><KelolaFormSEL /></RoleGuard>} />
                <Route path="/modul" element={<RoleGuard userRole={userRole} allowedRoles={['admin']}><ModulBsan /></RoleGuard>} />
                <Route path="/proporsi" element={<RoleGuard userRole={userRole} allowedRoles={['admin']}><ProporsiModul /></RoleGuard>} />
                <Route path="/funnel" element={<RoleGuard userRole={userRole} allowedRoles={['admin']}><GapFunnel activeKecamatan={activeKecamatan} /></RoleGuard>} />
                <Route path="/matriks" element={<RoleGuard userRole={userRole} allowedRoles={['admin']}><MatriksKuadran activeKecamatan={activeKecamatan} /></RoleGuard>} />
                <Route path="/tantangan" element={<RoleGuard userRole={userRole} allowedRoles={['admin']}><TantanganImplementasi activeKecamatan={activeKecamatan} /></RoleGuard>} />
                <Route path="/laporan" element={<RoleGuard userRole={userRole} allowedRoles={['admin']}><LaporanEkspor /></RoleGuard>} />

                {/* Pengawas & Admin Routes */}
                <Route path="/responden" element={<RoleGuard userRole={userRole} allowedRoles={['admin', 'pengawas']}><DataResponden activeKecamatan={activeKecamatan} setActiveKecamatan={setActiveKecamatan} searchTerm={searchTerm} onSearchChange={setSearchTerm} /></RoleGuard>} />
                <Route path="/observasi-sel" element={<RoleGuard userRole={userRole} allowedRoles={['admin', 'pengawas']}><ObservasiSEL userRole={userRole as 'admin' | 'pengawas'} /></RoleGuard>} />
                <Route path="/analisis-sel" element={<RoleGuard userRole={userRole} allowedRoles={['admin', 'pengawas']}><AnalisisSEL /></RoleGuard>} />

                {/* Sekolah & Admin Routes (Form Kuisioner BSAN) */}
                <Route path="/kuisioner" element={<RoleGuard userRole={userRole} allowedRoles={['admin', 'sekolah']}><Kuisioner userRole={userRole as 'admin' | 'pengawas' | 'sekolah'} /></RoleGuard>} />

                {/* Fallback wildcard */}
                <Route path="*" element={<Navigate to="/" replace />} />
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

  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('bsan_user_role');
    if (saved === 'admin' || saved === 'pengawas' || saved === 'sekolah') return saved;
    return 'admin';
  });

  // Sync role dari token saat mount
  useEffect(() => {
    const token = localStorage.getItem('bsan_auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'admin' || payload.role === 'pengawas' || payload.role === 'sekolah') {
          setUserRole(payload.role);
          localStorage.setItem('bsan_user_role', payload.role);
        }
      } catch {}
    }
  }, []);

  const handleLogout = () => {
    setTransitionText('Mengakhiri Sesi & Keluar Account...');
    setIsAuthTransitioning(true);
    setTimeout(() => {
      clearToken();
      localStorage.removeItem('bsan_user_role');
      localStorage.removeItem('bsan_user_profile');
      setIsLoggedIn(false);
      setIsAuthTransitioning(false);
      notifyToast({
        type: 'info',
        title: 'Logout Berhasil',
        message: 'Anda telah keluar dari akun.',
      });
    }, 1000);
  };

  // Store pending login user info for toast after navigation
  const [pendingLoginUser, setPendingLoginUser] = useState<any>(null);

  const handleLogin = (user: any, role: UserRole) => {
    setTransitionText('Menyiapkan Dashboard & Autentikasi Account...');
    setIsAuthTransitioning(true);
    setPendingLoginUser(user);
    setTimeout(() => {
      setUserRole(role);
      localStorage.setItem('bsan_user_role', role);
      setIsLoggedIn(true);
      setIsAuthTransitioning(false);
    }, 1000);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <OfflineGlobalBanner />
        <NotificationToastContainer />
        {isAuthTransitioning && <ThreeDotsLoader fullScreen={true} text={transitionText} size="lg" />}
        <Suspense fallback={<ThreeDotsLoader fullScreen={true} text="Memuat Halaman..." />}>
          <Routes>
            {/* Public Auth Routes — redirect to dashboard if already logged in */}
            <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />
            <Route path="/register" element={isLoggedIn ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />
            <Route path="/forgot-password" element={isLoggedIn ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />
            <Route path="/verify-otp" element={isLoggedIn ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />

            {/* Protected App Routes */}
            <Route
              path="/*"
              element={
                !isLoggedIn ? (
                  <Navigate to="/login" replace />
                ) : (
                  <AppContent 
                    userRole={userRole}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    activeKecamatan={activeKecamatan}
                    setActiveKecamatan={setActiveKecamatan}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    handleLogout={handleLogout}
                  />
                )
              }
            />
          </Routes>
        </Suspense>
        {/* Show welcome toast after successful login navigation */}
        <LoginToastTrigger user={pendingLoginUser} isLoggedIn={isLoggedIn} onDone={() => setPendingLoginUser(null)} />
      </Router>
    </QueryClientProvider>
  );
}

/** Tiny helper to fire welcome toast after login state settles */
function LoginToastTrigger({ user, isLoggedIn, onDone }: { user: any; isLoggedIn: boolean; onDone: () => void }) {
  useEffect(() => {
    if (user && isLoggedIn) {
      notifyToast({
        type: 'success',
        title: 'Login Berhasil!',
        message: `Selamat datang kembali, ${user?.nama || 'Pengguna'}!`,
      });
      onDone();
    }
  }, [user, isLoggedIn]);
  return null;
}

