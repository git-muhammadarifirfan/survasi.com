import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/services/api-client';
import {
  Search, Building2, Award, Users, ChevronLeft, ChevronRight,
  Phone, Mail, MapPin, ExternalLink, GraduationCap, BookOpen,
  X, Loader2, Copy, Check, ShieldCheck,
  Laptop, Droplets, FileText, Layers, RotateCcw, Sparkles, BarChart3
} from 'lucide-react';
import CustomSelect from '../../../shared/components/CustomSelect';
import ConnectionErrorCard from '../../../shared/components/ConnectionErrorCard';
import ThreeDotsLoader from '../../../shared/components/ThreeDotsLoader';

interface DataSatuanPendidikanProps {
  userRole?: 'admin' | 'pengawas' | 'sekolah';
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function DataSatuanPendidikan({ userRole = 'admin' }: DataSatuanPendidikanProps) {
  // Filter States
  const [selectedKab, setSelectedKab] = useState<string>('');
  const [selectedKec, setSelectedKec] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedJenjang, setSelectedJenjang] = useState<string>('');
  const [searchVal, setSearchVal] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const perPage = 12;

  // Fetch Kabupaten list
  const { data: kabupatenResponse } = useQuery({
    queryKey: ['db-kabupaten-sekolah'],
    queryFn: () => apiClient.sekolah.getKabupaten(),
    staleTime: 10 * 60 * 1000,
  });
  const kabupatenList = Array.isArray(kabupatenResponse?.data) ? kabupatenResponse.data : [];

  // Fetch Kecamatan list
  const { data: kecamatanResponse } = useQuery({
    queryKey: ['db-kecamatan-sekolah', selectedKab],
    queryFn: () => apiClient.sekolah.getKecamatan(selectedKab ? Number(selectedKab) : undefined),
    staleTime: 5 * 60 * 1000,
  });
  const kecamatanList = Array.isArray(kecamatanResponse?.data) ? kecamatanResponse.data : [];

  // Fetch School List from real MySQL Backend
  const { data: schoolsResponse, isLoading, isError, refetch } = useQuery({
    queryKey: ['schoolsProfiles', selectedKab, selectedKec, selectedStatus, selectedJenjang, searchVal, currentPage],
    queryFn: () => apiClient.sekolah.getAll({
      kabupaten_id: selectedKab ? Number(selectedKab) : undefined,
      kecamatan_id: selectedKec ? Number(selectedKec) : undefined,
      status: selectedStatus || undefined,
      jenjang: selectedJenjang || undefined,
      search: searchVal || undefined,
      page: currentPage,
      limit: perPage,
    }),
  });

  const schools = Array.isArray(schoolsResponse?.data) ? schoolsResponse.data : [];
  const totalItems = schoolsResponse?.total || schools.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  const handleResetFilters = () => {
    setSelectedKab('');
    setSelectedKec('');
    setSelectedStatus('');
    setSelectedJenjang('');
    setSearchVal('');
    setCurrentPage(1);
  };

  const hasActiveFilters = !!(selectedKab || selectedKec || selectedStatus || selectedJenjang || searchVal);

  if (isError) {
    return (
      <ConnectionErrorCard
        title="Gagal Memuat Data Sekolah"
        message="Gagal terhubung ke server database."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">

      {/* Header & Comprehensive Filter Bar */}
      <div className="rounded-2xl bg-surface p-5 sm:p-6 shadow-card border border-border animate-fade-in-up space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold font-display text-text-primary flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Direktori Satuan Pendidikan
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Referensi master profil satuan pendidikan sasaran se-Jawa Timur dengan filter wilayah, status, dan jenjang.
            </p>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              {totalItems.toLocaleString()} Satuan Pendidikan
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama sekolah, NPSN, atau alamat..."
            value={searchVal}
            onChange={(e) => { setSearchVal(e.target.value); setCurrentPage(1); }}
            className="w-full rounded-xl border border-border bg-bg/60 py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder-text-secondary/60 focus:border-primary/40 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/10 transition-smooth"
          />
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Filter Kabupaten / Kota */}
          <div>
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1 block">Kabupaten / Kota</label>
            <CustomSelect
              options={[
                { value: '', label: 'Semua Kabupaten / Kota' },
                ...kabupatenList.map((k: any) => ({ value: String(k.id), label: k.nama }))
              ]}
              value={selectedKab}
              onChange={(val) => {
                setSelectedKab(val);
                setSelectedKec('');
                setCurrentPage(1);
              }}
              placeholder="Pilih Kabupaten / Kota"
              enableSearch={true}
            />
          </div>

          {/* Filter Kecamatan */}
          <div>
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1 block">Kecamatan</label>
            <CustomSelect
              options={[
                { value: '', label: selectedKab ? 'Semua Kecamatan di Kabupaten Ini' : 'Semua Kecamatan' },
                ...kecamatanList.map((k: any) => ({ value: String(k.id), label: `Kec. ${k.nama.replace(/^Kec\.\s*/i, '')}` }))
              ]}
              value={selectedKec}
              onChange={(val) => { setSelectedKec(val); setCurrentPage(1); }}
              placeholder="Pilih Kecamatan"
              enableSearch={true}
            />
          </div>

          {/* Filter Status (Negeri / Swasta) */}
          <div>
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1 block">Status Sekolah</label>
            <CustomSelect
              options={[
                { value: '', label: 'Semua Status (Negeri & Swasta)' },
                { value: 'NEGERI', label: 'Negeri' },
                { value: 'SWASTA', label: 'Swasta' },
              ]}
              value={selectedStatus}
              onChange={(val) => { setSelectedStatus(val); setCurrentPage(1); }}
              placeholder="Status Sekolah"
            />
          </div>

          {/* Filter Jenjang */}
          <div>
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1 block">Jenjang / Bentuk</label>
            <CustomSelect
              options={[
                { value: '', label: 'Semua Jenjang' },
                { value: 'SD', label: 'SD (Sekolah Dasar)' },
                { value: 'SMP', label: 'SMP (Sekolah Menengah Pertama)' },
                { value: 'SMA', label: 'SMA (Sekolah Menengah Atas)' },
                { value: 'SMK', label: 'SMK (Sekolah Menengah Kejuruan)' },
                { value: 'SLB', label: 'SLB (Sekolah Luar Biasa)' },
                { value: 'PKBM', label: 'PKBM / Non-Formal' },
              ]}
              value={selectedJenjang}
              onChange={(val) => { setSelectedJenjang(val); setCurrentPage(1); }}
              placeholder="Pilih Jenjang"
            />
          </div>
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
            <span className="text-text-secondary text-[11px]">Filter aktif membatasi hasil pencarian.</span>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-text-secondary hover:text-rose-500 hover:border-rose-500/30 transition-smooth cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Semua Filter</span>
            </button>
          </div>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <ThreeDotsLoader text="Memuat direktori sekolah..." />
          </div>
        ) : schools.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-surface rounded-2xl border border-border space-y-2">
            <Building2 className="h-10 w-10 text-text-secondary/40 mx-auto" />
            <p className="text-sm font-bold text-text-primary">Tidak ditemukan profil sekolah</p>
            <p className="text-xs text-text-secondary">Coba ubah kata kunci atau reset filter pencarian Anda.</p>
          </div>
        ) : (
          schools.map((s: any, i: number) => (
            <div
              key={s.id}
              className="rounded-2xl bg-surface p-5 shadow-sm border border-border animate-fade-in-up hover:border-primary/40 transition-all flex flex-col justify-between"
              style={{ animationDelay: `${i * 25}ms` }}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="flex items-center space-x-1 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-md border border-primary/20">
                    <Building2 className="h-3 w-3" />
                    <span>NPSN {s.npsn || '-'}</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      (s.status_sekolah || '').toLowerCase().includes('negeri')
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                        : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                    }`}>
                      {s.status_sekolah || 'Swasta'}
                    </span>
                    <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      <span>{s.akreditasi || 'A'}</span>
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-text-primary text-sm leading-snug truncate mb-1" title={s.nama}>{s.nama}</h3>
                <p className="text-[11px] text-text-secondary truncate mb-3" title={s.alamat}>
                  {s.alamat || `Kecamatan ${s.kecamatan || '-'}`}
                </p>

                <div className="grid grid-cols-2 gap-3 py-2.5 border-y border-border/40 text-xs mb-3 bg-bg/40 rounded-xl px-3">
                  <div>
                    <p className="text-[9px] text-text-secondary uppercase font-bold tracking-wider">Total Siswa</p>
                    <p className="text-text-primary font-bold text-sm mt-0.5">{(s.total_siswa || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-text-secondary uppercase font-bold tracking-wider">Total Guru</p>
                    <p className="text-text-primary font-bold text-sm mt-0.5">{s.total_guru || 0}</p>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-text-secondary mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-3 w-3 flex-shrink-0 text-primary" />
                    <span className="truncate">{s.kecamatan || 'Kecamatan'}, {s.kabupaten || 'Kabupaten'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-3 w-3 flex-shrink-0 text-primary" />
                    <span className="truncate">{s.telepon || '(031) -'}</span>
                  </div>
                </div>
              </div>

              {/* Detail Profil Button */}
              <div>
                <Link
                  to={`/profil-sekolah/${s.npsn || s.id}`}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Detail Profil Penuh</span>
                </Link>
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
            className="rounded-lg p-2 text-text-secondary hover:bg-surface disabled:opacity-30 transition-smooth cursor-pointer"
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
                className={`h-9 w-9 rounded-xl text-xs font-semibold transition-smooth cursor-pointer ${
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
            className="rounded-lg p-2 text-text-secondary hover:bg-surface disabled:opacity-30 transition-smooth cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
