export type UserRole = 'admin' | 'pengawas';

export interface UserProfile {
  id: number;
  nama: string;
  email: string;
  role: UserRole;
  sekolahId?: number;
  kabupatenId?: number;
  kecamatanId?: number;
  jabatan?: string;
  instansi?: string;
  isActive: boolean;
}

export interface UserPreferences {
  bahasa: 'id' | 'en';
  tema: 'light' | 'dark';
  autoSaveInterval: number;
  notifWeeklyReport: boolean;
  notifInstantAlert: boolean;
  notifReminderEmail: boolean;
  notifSystemUpdate: boolean;
}
