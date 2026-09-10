/**
 * @module features/sekolah/pages
 * @description Master data sekolah dengan CRUD, filter, map pin, dan profil detail
 * @tables satuan_pendidikan, kecamatan, kabupaten
 * @api GET /api/sekolah, GET /api/sekolah/:id, PUT /api/sekolah/:id
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { database, KECAMATAN_LIST } from '../../../shared/data/data-source';
import { Search, Filter, Building2, CheckCircle2, Award, Users, ChevronLeft, ChevronRight, Phone, Mail, Save, X, Edit, MapPin } from 'lucide-react';
import CustomSelect from '../../../shared/components/CustomSelect';

interface DataSatuanPendidikanProps {
  userRole?: 'admin' | 'pengawas';
}

interface SchoolProfile {
  nama: string;
  npsn: string;
  akreditasi: string;
  status: string;
  alamat: string;
  kecamatan: string;
  kabupaten: string;
  totalSiswa: number;
  totalGuru: number;
  telepon: string;
  email: string;
}

export default function DataSatuanPendidikan({ userRole = 'admin' }: DataSatuanPendidikanProps) {
  // Common states
  const [showToast, setShowToast] = useState<string | null>(null);

  // Admin states
  const [selectedKec, setSelectedKec] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 12;

  // School / Pengawas states
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<SchoolProfile>({
    nama: 'SD Negeri Candi 1 Sidoarjo',
    npsn: '20501980',
    akreditasi: 'A (Sangat Baik)',
    status: 'SD (Negeri)',
    alamat: 'Jl. Candi Raya No. 45',
    kecamatan: 'Kec. Candi',
    kabupaten: 'Kab. Sidoarjo',
    totalSiswa: 340,
    totalGuru: 18,
    telepon: '(031) 8961234',
    email: 'sdncandi1@sch.id',
  });

  const { data: schools = [], isLoading } = useQuery({
    queryKey: ['schoolsProfiles', selectedKec, searchVal],
    queryFn: () => database.getSchools({
      kecamatan: selectedKec || undefined,
      search: searchVal || undefined,
    }),
    enabled: userRole === 'admin',
  });

  // Load school specific profile from localStorage
  useEffect(() => {
    if (userRole === 'pengawas') {
      const stored = localStorage.getItem('bsan_school_profile');
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    }
  }, [userRole]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      localStorage.setItem('bsan_school_profile', JSON.stringify(profile));
      setShowToast('Profil sekolah berhasil diperbarui');
      setTimeout(() => setShowToast(null), 3000);
    }, 1200);
  };

  const totalPages = Math.max(1, Math.ceil(schools.length / perPage));
  const paged = schools.slice((currentPage - 1) * perPage, currentPage * perPage);

  // ---------------------------------------------------
  // SCHOOL USER VIEW: PROFILE EDITOR
  // ---------------------------------------------------
  if (userRole === 'pengawas') {
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
          <h2 className="text-xl font-bold font-display text-text-primary">Profil Satuan Pendidikan</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Kelola data dasar sekolah Anda, kontak, dan kapasitas akomodasi sarana ajar.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main profile form details */}
          <div className="lg:col-span-2 rounded-card bg-surface p-6 shadow-card border border-border space-y-6">
            <h3 className="font-bold text-sm text-text-primary border-b border-border pb-3 flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span>Detail Informasi Sekolah</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-text-secondary uppercase">Nama Sekolah</label>
                <input
                  type="text"
                  required
                  value={profile.nama}
                  onChange={(e) => setProfile({ ...profile, nama: e.target.value })}
                  className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text-secondary uppercase">NPSN</label>
                <input
                  type="text"
                  required
                  disabled
                  value={profile.npsn}
                  className="w-full rounded-xl border border-border bg-border/40 px-3 py-2.5 text-text-secondary cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <CustomSelect
                  label="Akreditasi"
                  options={[
                    { value: 'A (Sangat Baik)', label: 'A (Sangat Baik)' },
                    { value: 'B (Baik)', label: 'B (Baik)' },
                    { value: 'C (Cukup)', label: 'C (Cukup)' },
                    { value: 'Belum Terakreditasi', label: 'Belum Terakreditasi' },
                  ]}
                  value={profile.akreditasi}
                  onChange={(val) => setProfile({ ...profile, akreditasi: val })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text-secondary uppercase">Status Jenjang</label>
                <input
                  type="text"
                  required
                  disabled
                  value={profile.status}
                  className="w-full rounded-xl border border-border bg-border/40 px-3 py-2.5 text-text-secondary cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-text-secondary uppercase">Alamat Lengkap</label>
                <textarea
                  required
                  rows={2}
                  value={profile.alamat}
                  onChange={(e) => setProfile({ ...profile, alamat: e.target.value })}
                  className="w-full rounded-xl border border-border bg-bg p-3 text-text-primary focus:border-primary focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text-secondary uppercase">Kecamatan</label>
                <input
                  type="text"
                  required
                  disabled
                  value={profile.kecamatan}
                  className="w-full rounded-xl border border-border bg-border/40 px-3 py-2.5 text-text-secondary cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text-secondary uppercase">Kabupaten</label>
                <input
                  type="text"
                  required
                  disabled
                  value={profile.kabupaten}
                  className="w-full rounded-xl border border-border bg-border/40 px-3 py-2.5 text-text-secondary cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center space-x-2 rounded-xl bg-primary hover:bg-primary-dark disabled:bg-primary/75 text-white px-6 py-3 text-xs font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-smooth cursor-pointer"
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
          </div>

          {/* Right contacts & capacity stats cards */}
          <div className="space-y-6">
            {/* Capacity card */}
            <div className="rounded-card bg-surface p-6 shadow-card border border-border space-y-4">
              <h3 className="font-bold text-sm text-text-primary border-b border-border pb-3 flex items-center space-x-2">
                <Users className="h-4 w-4 text-accent" />
                <span>Kapasitas Akademik</span>
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-bg/50 rounded-xl border border-border/60">
                  <span className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Total Siswa</span>
                  <div className="flex items-center space-x-1.5 mt-1.5">
                    <input
                      type="number"
                      required
                      value={profile.totalSiswa}
                      onChange={(e) => setProfile({ ...profile, totalSiswa: parseInt(e.target.value) || 0 })}
                      className="w-20 bg-surface border border-border rounded-lg px-2 py-1 text-xs font-bold text-text-primary text-center"
                    />
                    <span className="text-text-secondary font-medium">Anak</span>
                  </div>
                </div>

                <div className="p-3.5 bg-bg/50 rounded-xl border border-border/60">
                  <span className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Total Guru</span>
                  <div className="flex items-center space-x-1.5 mt-1.5">
                    <input
                      type="number"
                      required
                      value={profile.totalGuru}
                      onChange={(e) => setProfile({ ...profile, totalGuru: parseInt(e.target.value) || 0 })}
                      className="w-20 bg-surface border border-border rounded-lg px-2 py-1 text-xs font-bold text-text-primary text-center"
                    />
                    <span className="text-text-secondary font-medium">Orang</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact details card */}
            <div className="rounded-card bg-surface p-6 shadow-card border border-border space-y-4">
              <h3 className="font-bold text-sm text-text-primary border-b border-border pb-3 flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>Kontak & Saluran Sekolah</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-text-secondary uppercase">Nomor Telepon</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary" />
                    <input
                      type="text"
                      required
                      value={profile.telepon}
                      onChange={(e) => setProfile({ ...profile, telepon: e.target.value })}
                      className="w-full rounded-xl border border-border bg-bg pl-9 pr-3 py-2.5 text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-text-secondary uppercase">Email Sekolah</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary" />
                    <input
                      type="email"
                      required
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full rounded-xl border border-border bg-bg pl-9 pr-3 py-2.5 text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // ---------------------------------------------------
  // ADMIN DINAS VIEW: SEARCH, FILTER & RESPONDENTS LIST
  // ---------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-surface p-6 shadow-card border border-border animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold font-display text-text-primary">Direktori Satuan Pendidikan</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Referensi master data profil sekolah sasaran di Kabupaten Sidoarjo.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-text-primary">{schools.length} profil</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama sekolah atau NPSN..."
              value={searchVal}
              onChange={(e) => { setSearchVal(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-xl border border-border bg-bg/60 py-2.5 pl-9 pr-4 text-sm text-text-primary placeholder-text-secondary/60 focus:border-primary/40 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/10 transition-smooth"
            />
          </div>
          <div className="relative">
            <CustomSelect
              options={[
                { value: '', label: 'Semua Kecamatan' },
                ...KECAMATAN_LIST.map((k) => ({ value: `Kec. ${k}`, label: `Kec. ${k}` }))
              ]}
              value={selectedKec}
              onChange={(val) => { setSelectedKec(val); setCurrentPage(1); }}
              placeholder="Pilih Kecamatan"
              enableSearch={true}
            />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-sm text-text-secondary animate-pulse">Memuat profil sekolah...</div>
        ) : paged.length === 0 ? (
          <div className="col-span-full py-16 text-center text-sm text-text-secondary">Tidak ditemukan profil sekolah.</div>
        ) : (
          paged.map((s, i) => (
            <div
              key={s.id}
              className="rounded-2xl bg-surface p-5 shadow-sm border border-border animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="flex items-center space-x-1 bg-primary/8 text-primary text-[10px] font-bold px-2 py-0.5 rounded-md">
                  <Building2 className="h-3 w-3" />
                  <span>{s.npsn}</span>
                </span>
                <span className="flex items-center space-x-1 bg-accent/8 text-accent text-[10px] font-bold px-2 py-0.5 rounded-md">
                  <Award className="h-3 w-3" />
                  <span>{s.akreditasi}</span>
                </span>
              </div>

              <h3 className="font-bold text-text-primary text-sm leading-snug truncate mb-1">{s.nama}</h3>
              <p className="text-[11px] text-text-secondary truncate mb-4">{s.alamat}</p>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-border/40 text-xs mb-3">
                <div>
                  <p className="text-[10px] text-text-secondary/70 uppercase font-bold">Siswa</p>
                  <p className="text-text-primary font-bold mt-0.5">{s.totalSiswa.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-secondary/70 uppercase font-bold">Guru</p>
                  <p className="text-text-primary font-bold mt-0.5">{s.totalGuru}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-text-secondary">
                <div className="flex items-center space-x-2"><Phone className="h-3 w-3 flex-shrink-0" /><span className="truncate">{s.telepon}</span></div>
                <div className="flex items-center space-x-2"><Mail className="h-3 w-3 flex-shrink-0" /><span className="truncate">{s.email}</span></div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-1 animate-fade-in-up delay-200">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-lg p-2 text-text-secondary hover:bg-surface disabled:opacity-30 transition-smooth"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            let page: number;
            if (totalPages <= 7) { page = i + 1; }
            else if (currentPage <= 4) { page = i + 1; }
            else if (currentPage >= totalPages - 3) { page = totalPages - 6 + i; }
            else { page = currentPage - 3 + i; }
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-9 w-9 rounded-xl text-xs font-semibold transition-smooth ${
                  currentPage === page ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:bg-surface'
                }`}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg p-2 text-text-secondary hover:bg-surface disabled:opacity-30 transition-smooth"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
