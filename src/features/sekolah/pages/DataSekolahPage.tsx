/**
 * @module features/sekolah/pages
 * @description Master data sekolah dengan CRUD, multi-level filter (Kabupaten, Kecamatan, Status, Jenjang),
 *              dan Profil Detail Sekolah Sekolah-Kita Kemendikdasmen Style (Formal Enterprise Edition)
 * @tables satuan_pendidikan, kecamatan, kabupaten
 * @api GET /api/sekolah, GET /api/sekolah/:id, PUT /api/sekolah/:id
 * @api GET /api/kemendikdasmen/detail/:id, GET /api/kemendikdasmen/peserta-didik/:id
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
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

// ─── Kemendikdasmen Detail Modal (Formal Enterprise Portal) ─────────────────

function KemendikdasmenDetailModal({
  schoolNpsn,
  schoolNama,
  localSchoolData,
  onClose,
}: {
  schoolNpsn: string;
  schoolNama: string;
  localSchoolData?: any;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [copiedLink, setCopiedLink] = useState(false);

  // 1. Search Kemendikdasmen ID by NPSN / Name
  const { data: searchResult, isLoading: isSearching } = useQuery({
    queryKey: ['kemendikdasmen-search', schoolNpsn, schoolNama],
    queryFn: async () => {
      if (schoolNpsn && schoolNpsn !== '-') {
        let res = await apiClient.kemendikdasmen.cariSekolah({
          keyword: schoolNpsn,
          page_size: 5,
          page_number: 1,
        }).catch(() => null);

        let rows = res?.data || res?.result || res?.results || [];
        if (Array.isArray(rows) && rows.length > 0) return res;
      }

      if (schoolNama) {
        const cleanName = schoolNama.replace(/^(SD|SMP|SMA|SMK|SLB|PKBM)\s+/i, '').trim() || schoolNama;
        const resName = await apiClient.kemendikdasmen.cariSekolah({
          keyword: cleanName,
          page_size: 5,
          page_number: 1,
        }).catch(() => null);

        const rowsName = resName?.data || resName?.result || resName?.results || [];
        if (Array.isArray(rowsName) && rowsName.length > 0) return resName;
      }
      return null;
    },
    staleTime: 10 * 60 * 1000,
    enabled: true,
  });

  const sekolahIdKemendikdasmen =
    searchResult?.data?.[0]?.sekolah_id ||
    searchResult?.result?.[0]?.sekolah_id ||
    searchResult?.results?.[0]?.sekolah_id ||
    null;

  // 2. Fetch full detail + all sub-endpoints in parallel
  const { data: allDataResponse, isLoading: isLoadingAll } = useQuery({
    queryKey: ['kemendikdasmen-all-data', sekolahIdKemendikdasmen],
    queryFn: () => apiClient.kemendikdasmen.getAllData(sekolahIdKemendikdasmen!).catch(() => null),
    enabled: !!sekolahIdKemendikdasmen,
    staleTime: 10 * 60 * 1000,
  });

  const isLoading = isSearching || isLoadingAll;
  const combined = allDataResponse?.data || {};

  const detailData = combined.detail?.data || combined.detail || {};
  const pesertaDidikData = combined['peserta-didik']?.data || combined['peserta-didik'] || {};
  const ptkData = combined['ptk']?.data || combined['ptk'] || {};
  const rombelData = combined['rombongan-belajar']?.data || combined['rombongan-belajar'] || {};
  const saranaData = combined['sarana-prasarana']?.data || combined['sarana-prasarana'] || {};
  const tikData = combined['tik']?.data || combined['tik'] || {};

  // Metrics fallback values
  const totalSiswaL = pesertaDidikData?.laki_laki || pesertaDidikData?.jumlah_laki || pesertaDidikData?.l || 0;
  const totalSiswaP = pesertaDidikData?.perempuan || pesertaDidikData?.jumlah_perempuan || pesertaDidikData?.p || 0;
  const totalSiswa  = pesertaDidikData?.total || (totalSiswaL + totalSiswaP) || localSchoolData?.total_siswa || 0;
  const totalGuru   = ptkData?.total || ptkData?.jumlah || localSchoolData?.total_guru || 0;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-2 sm:p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-surface rounded-2xl shadow-2xl border border-border w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-surface shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-base font-display leading-tight">{schoolNama}</h3>
              <p className="text-[11px] text-text-secondary flex items-center gap-2 mt-0.5">
                <span>NPSN: <strong className="text-text-primary">{schoolNpsn || localSchoolData?.npsn || '-'}</strong></span>
                <span>·</span>
                <span className={`px-2 py-0.5 rounded-full font-semibold ${sekolahIdKemendikdasmen ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-primary/10 text-primary'}`}>
                  {sekolahIdKemendikdasmen ? 'Terverifikasi Service Kemendikdasmen' : 'Master Data Satuan Pendidikan Jatim'}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/profil-sekolah/${sekolahIdKemendikdasmen || schoolNpsn}`}
              className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1 hover:bg-primary/90 transition-smooth"
            >
              Halaman Penuh <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <button onClick={onClose} className="p-2 rounded-xl text-text-secondary hover:bg-border/40 transition-smooth cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-bg/40">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="h-9 w-9 text-primary mx-auto animate-spin" />
              <p className="text-xs text-text-secondary font-medium">Memuat data resmi profil satuan pendidikan...</p>
            </div>
          ) : (
            <>
              {/* Top Banner / Main School Card */}
              <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* Left: School Profile Box */}
                  <div className="md:col-span-5 relative rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-primary/20 border border-border/60 p-6 flex flex-col justify-between min-h-[220px]">
                    <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-text-primary shadow-sm flex items-center gap-1 border border-border/40">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      <span>{detailData?.status_sekolah_str || detailData?.status || localSchoolData?.status_sekolah || 'Swasta'}</span>
                    </div>

                    <div className="space-y-2 mt-4">
                      <div className="w-12 h-12 rounded-2xl bg-surface shadow-md flex items-center justify-center text-primary">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <h4 className="font-bold text-text-primary text-base font-display leading-snug">{schoolNama}</h4>
                      <p className="text-xs text-text-secondary line-clamp-2">
                        {detailData?.alamat_jalan || detailData?.alamat || localSchoolData?.alamat || 'Alamat Resmi Terdaftar'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-text-secondary mt-4 pt-3 border-t border-border/40">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">
                        {detailData?.kecamatan || localSchoolData?.kecamatan || 'Kecamatan'}, {detailData?.kabupaten_kota || detailData?.kabupaten || localSchoolData?.kabupaten || 'Jawa Timur'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Key Info Grid */}
                  <div className="md:col-span-7 grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-bg/60 p-3 rounded-xl border border-border/40">
                      <div className="text-[10px] text-text-secondary font-medium flex items-center gap-1 mb-1">
                        <Award className="h-3.5 w-3.5 text-amber-500" /> Status Akreditasi
                      </div>
                      <div className="font-bold text-text-primary text-sm font-display">{detailData?.akreditasi || detailData?.nilai_akreditasi || localSchoolData?.akreditasi || 'A (Sangat Baik)'}</div>
                    </div>

                    <div className="bg-bg/60 p-3 rounded-xl border border-border/40">
                      <div className="text-[10px] text-text-secondary font-medium flex items-center gap-1 mb-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Status Sekolah
                      </div>
                      <div className="font-bold text-text-primary text-sm font-display">{detailData?.status_sekolah_str || detailData?.status || localSchoolData?.status_sekolah || 'Swasta'}</div>
                    </div>

                    <div className="bg-bg/60 p-3 rounded-xl border border-border/40">
                      <div className="text-[10px] text-text-secondary font-medium flex items-center gap-1 mb-1">
                        <Building2 className="h-3.5 w-3.5 text-blue-500" /> NPSN
                      </div>
                      <div className="font-bold text-primary text-sm font-display flex items-center gap-1">
                        {schoolNpsn || localSchoolData?.npsn || '-'}
                        {sekolahIdKemendikdasmen && (
                          <a
                            href={`https://sekolah.data.kemendikdasmen.go.id/profil-sekolah/${sekolahIdKemendikdasmen}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:opacity-80"
                            title="Buka Referensi Resmi Kemendikdasmen"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="bg-bg/60 p-3 rounded-xl border border-border/40">
                      <div className="text-[10px] text-text-secondary font-medium flex items-center gap-1 mb-1">
                        <BookOpen className="h-3.5 w-3.5 text-emerald-500" /> Bentuk Pendidikan
                      </div>
                      <div className="font-bold text-text-primary text-sm font-display">{detailData?.bentuk_pendidikan_str || detailData?.bentuk_pendidikan || localSchoolData?.jenjang || 'SD'}</div>
                    </div>

                    <div className="bg-bg/60 p-3 rounded-xl border border-border/40">
                      <div className="text-[10px] text-text-secondary font-medium flex items-center gap-1 mb-1">
                        <Phone className="h-3.5 w-3.5 text-purple-500" /> Telepon
                      </div>
                      <div className="font-semibold text-text-primary text-xs truncate">{detailData?.nomor_telepon || detailData?.telepon || localSchoolData?.telepon || '(031) -'}</div>
                    </div>

                    <div className="bg-bg/60 p-3 rounded-xl border border-border/40">
                      <div className="text-[10px] text-text-secondary font-medium flex items-center gap-1 mb-1">
                        <Mail className="h-3.5 w-3.5 text-rose-500" /> Email Resmi
                      </div>
                      <div className="font-semibold text-text-primary text-xs truncate" title={detailData?.email || localSchoolData?.email}>
                        {detailData?.email || localSchoolData?.email || `${schoolNpsn || 'sekolah'}@survasi.com`}
                      </div>
                    </div>

                    <div className="bg-bg/60 p-3 rounded-xl border border-border/40 col-span-2">
                      <div className="text-[10px] text-text-secondary font-medium flex items-center gap-1 mb-1">
                        <Building2 className="h-3.5 w-3.5 text-indigo-500" /> Yayasan / Instansi Pembina
                      </div>
                      <div className="font-semibold text-text-primary text-xs truncate">
                        {detailData?.yayasan || detailData?.nama_yayasan || 'Dinas Pendidikan Provinsi Jawa Timur'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 8 KPI Main Statistics Grid */}
              <div>
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Statistik Utama Satuan Pendidikan
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Total Guru (PTK)', value: totalGuru, icon: GraduationCap, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
                    { label: 'Siswa Laki-laki', value: totalSiswaL, icon: Users, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
                    { label: 'Siswa Perempuan', value: totalSiswaP, icon: Users, color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/40' },
                    { label: 'Total Siswa', value: totalSiswa, icon: Users, color: 'text-primary bg-primary/10' },
                    { label: 'Rombongan Belajar', value: detailData?.rombongan_belajar || rombelData?.length || rombelData?.total || 6, icon: Layers, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
                    { label: 'Ruang Kelas', value: detailData?.ruang_kelas || saranaData?.ruang_kelas || 6, icon: Building2, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
                    { label: 'Laboratorium', value: detailData?.laboratorium || saranaData?.laboratorium || 1, icon: Laptop, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' },
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
