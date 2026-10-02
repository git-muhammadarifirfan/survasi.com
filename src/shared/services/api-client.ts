/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * API CLIENT — BSAN JAWA TIMUR MONITORING SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Centralized HTTP client untuk semua komunikasi dengan Backend API.
 * Base URL dikonfigurasi via VITE_API_BASE_URL (default: http://localhost:3001/api).
 *
 * Semua method:
 *   - Otomatis menyertakan Authorization: Bearer <token> dari localStorage
 *   - Return typed response
 *   - Throw Error dengan message dari API bila response !ok
 *   - Pada 401 → redirect ke /login otomatis
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY    = 'bsan_auth_token';

// ─── HTTP Helpers ─────────────────────────────────────────────────────────────

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers || {}),
  };

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  } catch (err: any) {
    if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('Failed')) {
      throw new Error('Gagal terhubung ke sistem. Silakan periksa koneksi internet Anda atau coba beberapa saat lagi.');
    }
    throw err;
  }

  // Auto-redirect on unauthorized (kecuali endpoint login / registrasi / public auth pages)
  const isAuthPage = typeof window !== 'undefined' && (
    window.location.pathname.startsWith('/login') ||
    window.location.pathname.startsWith('/register') ||
    window.location.pathname.startsWith('/forgot-password') ||
    window.location.pathname.startsWith('/verify-otp')
  );

  if (response.status === 401 && !endpoint.startsWith('/auth') && !endpoint.startsWith('/sekolah/options') && !isAuthPage) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/login';
    throw new Error('Sesi berakhir. Silakan login kembali.');
  }

  // Handle 429 Too Many Requests (Rate Limiting / Throttling)
  if (response.status === 429) {
    const errorData = await response.json().catch(() => ({ message: 'Terlalu banyak permintaan.' }));
    const msg = errorData.message || 'Batas pengiriman server terlampaui. Mohon tunggu beberapa saat.';
    window.dispatchEvent(
      new CustomEvent('bsan_rate_limit_exceeded', {
        detail: { message: msg },
      })
    );
    throw new Error(msg);
  }

  const data = await response.json().catch(() => ({ message: response.statusText }));
  if (!response.ok) {
    throw new Error((data as any).message || `HTTP ${response.status}`);
  }

  return data as T;
}

type ApiResponse<T> = { success: boolean; data: T; message?: string };
type ListResponse<T> = { success: boolean; data: T[]; total: number; page: number; limit: number };

// ─── API Client ───────────────────────────────────────────────────────────────

export const apiClient = {
  /** Generic GET request wrapper */
  get: <T = any>(endpoint: string) => fetchJson<ApiResponse<T>>(endpoint),

  /** Generic POST request wrapper */
  post: <T = any>(endpoint: string, data?: any) =>
    fetchJson<ApiResponse<T>>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  /** Generic PUT request wrapper */
  put: <T = any>(endpoint: string, data?: any) =>
    fetchJson<ApiResponse<T>>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  /** Generic DELETE request wrapper */
  delete: <T = any>(endpoint: string) =>
    fetchJson<ApiResponse<T>>(endpoint, {
      method: 'DELETE',
    }),

  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    /** Login dengan email atau NPSN sekolah */
    login: (credentials: { identifier: string; password: string }) =>
      fetchJson<{ success: boolean; token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),

    /** Registrasi akun sekolah baru */
    registerSekolah: (payload: { nama: string; email: string; password: string; sekolah_id: number; sekolah_nama?: string }) =>
      fetchJson<{ success: boolean; token: string; user: any; message: string }>('/auth/register-sekolah', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    /** Registrasi akun pengawas baru */
    registerPengawas: (payload: { nama: string; email: string; password: string }) =>
      fetchJson<{ success: boolean; token: string; user: any; message: string }>('/auth/register-pengawas', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    /** Kirim ulang kode OTP baru (Kode lama otomatis hangus) */
    resendOtp: (payload: { email: string; nama?: string; type?: string }) =>
      fetchJson<{ success: boolean; message: string }>('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    /** Permintaan reset password / kirim kode OTP reset */
    forgotPassword: (payload: { email: string }) =>
      fetchJson<{ success: boolean; message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    /** Verifikasi kode OTP */
    verifyOtp: (payload: { email: string; otp_code: string }) =>
      fetchJson<{ success: boolean; verified: boolean; type: string; message: string }>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    /** Reset password setelah OTP terverifikasi */
    resetPassword: (payload: { email: string; otp_code: string; new_password: string }) =>
      fetchJson<{ success: boolean; message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    logout: () =>
      fetchJson<{ success: boolean }>('/auth/logout', { method: 'POST' }),

    /** Get profil + preferensi user yang sedang login */
    getProfile: () =>
      fetchJson<ApiResponse<any>>('/auth/me'),

    /** Ganti password */
    changePassword: (payload: { current_password: string; new_password: string }) =>
      fetchJson<{ success: boolean; message: string }>('/auth/password', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
  },


  // ── Dashboard ──────────────────────────────────────────────────────────────
  dashboard: {
    getSummary: (filters?: { kabupaten_id?: number; kecamatan_id?: number }) => {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters || {}).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]))
      ).toString();
      return fetchJson<ApiResponse<any>>(`/dashboard/summary?${params}`);
    },

    getRegionalStats: (kabupatenId?: number) =>
      fetchJson<ApiResponse<any[]>>(`/dashboard/regional-stats${kabupatenId ? `?kabupaten_id=${kabupatenId}` : ''}`),

    getKabupatenStats: () =>
      fetchJson<ApiResponse<any[]>>('/dashboard/kabupaten-stats'),

    getActivities: (opts?: { kabupaten_id?: number; limit?: number }) => {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(opts || {}).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]))
      ).toString();
      return fetchJson<ApiResponse<any[]>>(`/dashboard/activities?${params}`);
    },

    getFollowUp: (kabupatenId?: number) =>
      fetchJson<ApiResponse<any[]>>(`/dashboard/follow-up${kabupatenId ? `?kabupaten_id=${kabupatenId}` : ''}`),

    getTimeseries: (kabupatenId?: number) =>
      fetchJson<ApiResponse<any[]>>(`/dashboard/timeseries${kabupatenId ? `?kabupaten_id=${kabupatenId}` : ''}`),

    getModulProgress: (kabupatenId?: number) =>
      fetchJson<ApiResponse<any[]>>(`/dashboard/modul-progress${kabupatenId ? `?kabupaten_id=${kabupatenId}` : ''}`),
  },

  // ── Sekolah ────────────────────────────────────────────────────────────────
  sekolah: {
    getAll: (params?: { kabupaten_id?: number; kecamatan_id?: number; kecamatan?: string; status?: string; jenjang?: string; search?: string; page?: number; limit?: number }) => {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]))
      ).toString();
      return fetchJson<ListResponse<any>>(`/sekolah?${query}`);
    },

    getById: (id: number | string) =>
      fetchJson<ApiResponse<any>>(`/sekolah/${id}`),

    getDetail: (id: number | string) =>
      fetchJson<ApiResponse<any>>(`/sekolah/${id}`),

    update: (id: number, data: any) =>
      fetchJson<{ success: boolean; message: string }>(`/sekolah/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    getKabupaten: () =>
      fetchJson<ApiResponse<any[]>>('/sekolah/kabupaten'),

    getKecamatan: (kabupatenId?: number) =>
      fetchJson<ApiResponse<any[]>>(`/sekolah/kecamatan${kabupatenId ? `?kabupaten_id=${kabupatenId}` : ''}`),

    getOptions: () =>
      fetchJson<ApiResponse<any[]>>('/sekolah/options'),

    sendReminder: (id: number | string) =>
      fetchJson<{ success: boolean; is_registered: boolean; message: string }>(`/sekolah/${id}/reminder`, { method: 'POST' }),

    getAnswers: (id: number | string) =>
      fetchJson<{ success: boolean; responden?: any; data: Array<{ id: number; kode: string; pertanyaan: string; section: string; tipe: string; jawaban: string }> }>(`/sekolah/${id}/answers`),
  },

  // ── Users Management (Admin) ───────────────────────────────────────────────
  users: {
    getAll: (params?: { role?: string; search?: string; page?: number; limit?: number }) => {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]))
      ).toString();
      return fetchJson<ListResponse<any>>(`/users?${query}`);
    },

    create: (data: any) =>
      fetchJson<{ success: boolean; id: number; message: string }>('/users', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: number, data: any) =>
      fetchJson<{ success: boolean; message: string }>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    toggleStatus: (id: number, isActive: boolean) =>
      fetchJson<{ success: boolean; message: string }>(`/users/${id}/status`, { method: 'PUT', body: JSON.stringify({ is_active: isActive }) }),

    delete: (id: number) =>
      fetchJson<{ success: boolean; message: string }>(`/users/${id}`, { method: 'DELETE' }),
  },


  // ── Notifikasi ─────────────────────────────────────────────────────────────
  notifikasi: {
    getAll: () =>
      fetchJson<{ success: boolean; data: any[]; unread_count: number }>('/notifikasi'),

    markRead: (id: number) =>
      fetchJson<{ success: boolean }>(`/notifikasi/${id}/read`, { method: 'PUT' }),

    sendBroadcast: (data: { target_role?: string; user_id?: number; judul: string; pesan: string; tipe?: string }) =>
      fetchJson<{ success: boolean; message: string }>('/notifikasi/send', { method: 'POST', body: JSON.stringify(data) }),
  },


  // ── Responden ──────────────────────────────────────────────────────────────
  responden: {
    getAll: (params?: { kabupaten_id?: number; kecamatan_id?: number; penerima_modul?: string; status_implementasi?: string; search?: string; page?: number; limit?: number }) => {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]))
      ).toString();
      return fetchJson<ListResponse<any>>(`/responden?${query}`);
    },

    getSummary: (kabupatenId?: number) =>
      fetchJson<ApiResponse<any>>(`/responden/summary${kabupatenId ? `?kabupaten_id=${kabupatenId}` : ''}`),

    getDistribusi: (kabupatenId?: number) =>
      fetchJson<ApiResponse<any[]>>(`/responden/distribusi${kabupatenId ? `?kabupaten_id=${kabupatenId}` : ''}`),

    getExport: (kabupatenId?: number) =>
      fetchJson<ApiResponse<any[]>>(`/responden/export${kabupatenId ? `?kabupaten_id=${kabupatenId}` : ''}`),
  },

  // ── Analisis ───────────────────────────────────────────────────────────────
  analisis: {
    getModulProgress: (kabupatenId?: number) =>
      fetchJson<ApiResponse<any[]>>(`/analisis/modul-progress${kabupatenId ? `?kabupaten_id=${kabupatenId}` : ''}`),

    getModulDetail: (kabupatenId?: number) =>
      fetchJson<ApiResponse<any[]>>(`/analisis/modul-detail${kabupatenId ? `?kabupaten_id=${kabupatenId}` : ''}`),

    getProporsi: (kabupatenId?: number) =>
      fetchJson<ApiResponse<any>>(`/analisis/proporsi${kabupatenId ? `?kabupaten_id=${kabupatenId}` : ''}`),

    getFunnel: (kabupatenId?: number) =>
      fetchJson<ApiResponse<any[]>>(`/analisis/funnel${kabupatenId ? `?kabupaten_id=${kabupatenId}` : ''}`),

    getMatriks: (kabupatenId?: number) =>
      fetchJson<ApiResponse<any[]>>(`/analisis/matriks${kabupatenId ? `?kabupaten_id=${kabupatenId}` : ''}`),

    getTantangan: (kabupatenId?: number) =>
      fetchJson<ApiResponse<any>>(`/analisis/tantangan${kabupatenId ? `?kabupaten_id=${kabupatenId}` : ''}`),

    getFrameworks: (kabupatenId?: number) =>
      fetchJson<ApiResponse<any[]>>(`/analisis/frameworks${kabupatenId ? `?kabupaten_id=${kabupatenId}` : ''}`),

    getModulBreakdown: (kabupatenId?: number, modulId?: number) => {
      const params = new URLSearchParams();
      if (kabupatenId) params.append('kabupaten_id', String(kabupatenId));
      if (modulId) params.append('modul_id', String(modulId));
      const q = params.toString();
      return fetchJson<ApiResponse<Record<number, any>>>(`/analisis/modul-breakdown${q ? `?${q}` : ''}`);
    },
  },

  // ── SEL ────────────────────────────────────────────────────────────────────
  sel: {
    getIndikator: () =>
      fetchJson<ApiResponse<any[]>>('/sel/indikator'),

    getDimensi: () =>
      fetchJson<ApiResponse<any[]>>('/sel/dimensi'),

    createDimensi: (data: { kode?: string; nama: string; modul_bsan_kode?: string; urutan?: number }) =>
      fetchJson<{ success: boolean; id: number; message: string }>('/sel/dimensi', { method: 'POST', body: JSON.stringify(data) }),

    getKonteks: (kategori?: string, all?: boolean) => {
      const params = new URLSearchParams();
      if (kategori) params.append('kategori', kategori);
      if (all) params.append('all', 'true');
      const q = params.toString();
      return fetchJson<ApiResponse<any[]>>(`/sel/konteks${q ? `?${q}` : ''}`);
    },

    createKonteks: (data: { kategori: string; label: string; value_code?: string; urutan?: number }) =>
      fetchJson<{ success: boolean; id: number; message: string }>('/sel/konteks', { method: 'POST', body: JSON.stringify(data) }),

    updateKonteks: (id: number, data: any) =>
      fetchJson<{ success: boolean; message: string }>(`/sel/konteks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    reorderKonteks: (items: { id: number; urutan: number }[]) =>
      fetchJson<{ success: boolean; message: string }>('/sel/konteks/reorder', { method: 'PUT', body: JSON.stringify({ items }) }),

    deleteKonteks: (id: number) =>
      fetchJson<{ success: boolean; message: string }>(`/sel/konteks/${id}`, { method: 'DELETE' }),

    createIndikator: (data: any) =>
      fetchJson<{ success: boolean; id: number }>('/sel/indikator', { method: 'POST', body: JSON.stringify(data) }),

    updateIndikator: (id: number, data: any) =>
      fetchJson<{ success: boolean }>(`/sel/indikator/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    deleteIndikator: (id: number) =>
      fetchJson<{ success: boolean }>(`/sel/indikator/${id}`, { method: 'DELETE' }),

    submitSesi: (payload: any) =>
      fetchJson<{ success: boolean; sesi_id: number; message?: string }>('/sel/sesi', { method: 'POST', body: JSON.stringify(payload) }),

    getSesi: (kabupatenId?: number) =>
      fetchJson<ApiResponse<any[]>>(`/sel/sesi${kabupatenId ? `?kabupaten_id=${kabupatenId}` : ''}`),

    getScores: (kabupatenId?: number) =>
      fetchJson<ApiResponse<any[]>>(`/sel/analisis/scores${kabupatenId ? `?kabupaten_id=${kabupatenId}` : ''}`),

    getHeatmap: (kabupatenId?: number) =>
      fetchJson<ApiResponse<any[]>>(`/sel/analisis/heatmap${kabupatenId ? `?kabupaten_id=${kabupatenId}` : ''}`),

    getRadar: (sekolahId: number) =>
      fetchJson<ApiResponse<any[]>>(`/sel/analisis/radar/${sekolahId}`),

    getSummary: (kabupatenId?: number) =>
      fetchJson<ApiResponse<any>>(`/sel/analisis/summary${kabupatenId ? `?kabupaten_id=${kabupatenId}` : ''}`),

    getMatriks: (kabupatenId?: number) =>
      fetchJson<ApiResponse<any[]>>(`/sel/analisis/matriks${kabupatenId ? `?kabupaten_id=${kabupatenId}` : ''}`),

    getSummaryStats: (kabupatenId?: number) =>
      fetchJson<ApiResponse<any>>(`/sel/summary-stats${kabupatenId ? `?kabupaten_id=${kabupatenId}` : ''}`),
  },

  // ── Suara Responden ────────────────────────────────────────────────────────
  suara: {
    getAll: (params?: { kabupaten_id?: number; sentimen?: string; modul_id?: number; page?: number; limit?: number }) => {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]))
      ).toString();
      return fetchJson<ListResponse<any>>(`/suara?${query}`);
    },

    getSentimen: (kabupatenId?: number) =>
      fetchJson<ApiResponse<any[]>>(`/suara/sentimen${kabupatenId ? `?kabupaten_id=${kabupatenId}` : ''}`),

    getNarasiQ33: (kabupatenId?: number) =>
      fetchJson<ApiResponse<any[]>>(`/suara/narasi-q33${kabupatenId ? `?kabupaten_id=${kabupatenId}` : ''}`),

    getNarasiQ35: (kabupatenId?: number) =>
      fetchJson<ApiResponse<any[]>>(`/suara/narasi-q35${kabupatenId ? `?kabupaten_id=${kabupatenId}` : ''}`),

    submit: (data: { sekolah_id: number; modul_id?: number; komentar: string; sentimen: string; tanggal?: string }) =>
      fetchJson<{ success: boolean; id: number }>('/suara', { method: 'POST', body: JSON.stringify(data) }),
  },

  // ── Laporan ────────────────────────────────────────────────────────────────
  laporan: {
    getRekap: () =>
      fetchJson<ApiResponse<any[]>>('/laporan/rekap'),

    getHistory: () =>
      fetchJson<ApiResponse<any[]>>('/laporan/history'),

    generate: (options: { tipe: 'pdf' | 'excel' | 'docx'; filter?: any }) =>
      fetchJson<{ success: boolean; downloadUrl: string; reportId: number }>('/laporan/generate', {
        method: 'POST',
        body: JSON.stringify(options),
      }),
  },

  // ── Setting ────────────────────────────────────────────────────────────────
  setting: {
    getProfile: () =>
      fetchJson<ApiResponse<any>>('/setting/profile'),

    updateProfile: (data: { nama: string; phone?: string; jabatan?: string; instansi?: string }) =>
      fetchJson<{ success: boolean; message: string }>('/setting/profile', { method: 'PUT', body: JSON.stringify(data) }),

    getPreferences: () =>
      fetchJson<ApiResponse<any>>('/setting/preferences'),

    updatePreferences: (prefs: any) =>
      fetchJson<{ success: boolean }>('/setting/preferences', { method: 'PUT', body: JSON.stringify(prefs) }),

    getNotifications: (opts?: { limit?: number; offset?: number }) => {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(opts || {}).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]))
      ).toString();
      return fetchJson<ApiResponse<any[]>>(`/setting/notifikasi?${params}`);
    },

    getUnreadCount: () =>
      fetchJson<{ success: boolean; unread: number }>('/setting/notifikasi/unread-count'),

    markRead: (id: number) =>
      fetchJson<{ success: boolean }>(`/setting/notifikasi/${id}/read`, { method: 'PUT' }),

    markAllRead: () =>
      fetchJson<{ success: boolean }>('/setting/notifikasi/read-all', { method: 'PUT' }),

    getUsers: () =>
      fetchJson<ApiResponse<any[]>>('/setting/users'),

    createUser: (data: any) =>
      fetchJson<{ success: boolean; id: number; message: string }>('/setting/users', { method: 'POST', body: JSON.stringify(data) }),

    toggleUser: (id: number, isActive: boolean) =>
      fetchJson<{ success: boolean }>(`/setting/users/${id}/toggle`, { method: 'PUT', body: JSON.stringify({ is_active: isActive }) }),

    getActivityLog: () =>
      fetchJson<ApiResponse<any[]>>('/setting/activity-log'),

    // ── Target Observasi ──
    getTargetObservasi: () =>
      fetchJson<ApiResponse<{ default_target: number; schools: any[] }>>('/setting/target-observasi'),

    updateTargetObservasi: (data: { default_target: number; apply_to_all?: boolean }) =>
      fetchJson<{ success: boolean; message: string }>('/setting/target-observasi', { method: 'PUT', body: JSON.stringify(data) }),

    updateTargetObservasiSekolah: (sekolahId: number, target: number) =>
      fetchJson<{ success: boolean; message: string }>(`/setting/target-observasi/${sekolahId}`, { method: 'PUT', body: JSON.stringify({ target }) }),

    updateTargetObservasiBatch: (items: { sekolah_id: number; target: number }[]) =>
      fetchJson<{ success: boolean; message: string }>('/setting/target-observasi/batch', { method: 'PUT', body: JSON.stringify({ items }) }),
  },

  // ── Kemendikdasmen (Government School Data API Proxy) ──────────────────────
  kemendikdasmen: {
    /** Cari sekolah via Kemendikdasmen API */
    cariSekolah: (params: {
      keyword?: string;
      kode_wilayah?: string;
      bentuk_pendidikan_id?: number;
      status_sekolah?: number;
      page_size?: number;
      page_number?: number;
    }) =>
      fetchJson<any>('/kemendikdasmen/cari-sekolah', {
        method: 'POST',
        body: JSON.stringify(params),
      }),

    /** Get full detail of a school */
    getDetail: (sekolahId: string) =>
      fetchJson<any>(`/kemendikdasmen/detail/${sekolahId}`),

    /** Get student data (peserta didik) */
    getPesertaDidik: (sekolahId: string) =>
      fetchJson<any>(`/kemendikdasmen/peserta-didik/${sekolahId}`),

    /** Get teacher/staff data (PTK) */
    getPTK: (sekolahId: string) =>
      fetchJson<any>(`/kemendikdasmen/ptk/${sekolahId}`),

    /** Get study group data (rombongan belajar) */
    getRombonganBelajar: (sekolahId: string) =>
      fetchJson<any>(`/kemendikdasmen/rombongan-belajar/${sekolahId}`),

    /** Get accreditation data */
    getAkreditasi: (sekolahId: string) =>
      fetchJson<any>(`/kemendikdasmen/akreditasi/${sekolahId}`),

    /** Get facilities data */
    getSaranaPrasarana: (sekolahId: string) =>
      fetchJson<any>(`/kemendikdasmen/sarana-prasarana/${sekolahId}`),

    /** Get all data for a school (detail + all sub-endpoints in parallel) */
    getAllData: (sekolahId: string) =>
      fetchJson<{ success: boolean; sekolah_id: string; data: any }>(`/kemendikdasmen/all/${sekolahId}`),
  },
};

// ─── Token Helpers ────────────────────────────────────────────────────────────

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    // Simple expiry check without verifying signature (server verifies)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
