/**
 * @module features/sekolah/pages
 * @description Master data sekolah dengan CRUD, filter, map pin, dan profil detail
 * @tables satuan_pendidikan, kecamatan, kabupaten
 * @api GET /api/sekolah, GET /api/sekolah/:id, PUT /api/sekolah/:id
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/services/api-client';
import { KECAMATAN_LIST } from '../../../shared/data/data-source';
import { Search, Filter, Building2, CheckCircle2, Award, Users, ChevronLeft, ChevronRight, Phone, Mail, Save, X, Edit, MapPin } from 'lucide-react';
import CustomSelect from '../../../shared/components/CustomSelect';

interface DataSatuanPendidikanProps {
  userRole?: 'admin' | 'pengawas' | 'sekolah';
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
  // Filter & Pagination states
  const [selectedKec, setSelectedKec] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 12;

  // Query real MySQL API for master data sekolah
  const { data: schoolsResponse, isLoading, isError } = useQuery({
    queryKey: ['schoolsProfiles', selectedKec, searchVal, currentPage],
    queryFn: () => apiClient.sekolah.getAll({
      kecamatan_id: selectedKec ? Number(selectedKec) : undefined,
      search: searchVal || undefined,
      page: currentPage,
      limit: perPage,
    }),
  });

  const schools = Array.isArray(schoolsResponse?.data) ? schoolsResponse.data : [];
  const totalItems = schoolsResponse?.total || schools.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  // ---------------------------------------------------
  // DIREKTORI SATUAN PENDIDIKAN (ALL ROLES: ADMIN, PENGAWAS, SEKOLAH)
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
            <span className="text-xs font-semibold text-text-primary">{totalItems} satuan pendidikan</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama sekolah, NPSN, atau alamat..."
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
          <div className="col-span-full py-16 text-center text-sm text-text-secondary animate-pulse">Memuat profil sekolah dari database...</div>
        ) : isError ? (
          <div className="col-span-full py-16 text-center text-sm text-status-belum font-semibold">Gagal memuat data sekolah.</div>
        ) : schools.length === 0 ? (
          <div className="col-span-full py-16 text-center text-sm text-text-secondary">Tidak ditemukan profil sekolah.</div>
        ) : (
          schools.map((s: any, i: number) => (
            <div
              key={s.id}
              className="rounded-2xl bg-surface p-5 shadow-sm border border-border animate-fade-in-up hover:border-primary/40 transition-all"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="flex items-center space-x-1 bg-primary/8 text-primary text-[10px] font-bold px-2 py-0.5 rounded-md">
                  <Building2 className="h-3 w-3" />
                  <span>{s.npsn || 'NPSN -'}</span>
                </span>
                <span className="flex items-center space-x-1 bg-accent/8 text-accent text-[10px] font-bold px-2 py-0.5 rounded-md">
                  <Award className="h-3 w-3" />
                  <span>{s.akreditasi || 'A (Sangat Baik)'}</span>
                </span>
              </div>

              <h3 className="font-bold text-text-primary text-sm leading-snug truncate mb-1" title={s.nama}>{s.nama}</h3>
              <p className="text-[11px] text-text-secondary truncate mb-4" title={s.alamat}>{s.alamat || `Kecamatan ${s.kecamatan || '-'}`}</p>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-border/40 text-xs mb-3">
                <div>
                  <p className="text-[10px] text-text-secondary/70 uppercase font-bold">Siswa</p>
                  <p className="text-text-primary font-bold mt-0.5">{(s.total_siswa || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-secondary/70 uppercase font-bold">Guru</p>
                  <p className="text-text-primary font-bold mt-0.5">{s.total_guru || 0}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-text-secondary">
                <div className="flex items-center space-x-2"><Phone className="h-3 w-3 flex-shrink-0 text-primary" /><span className="truncate">{s.telepon || '(031) -'}</span></div>
                <div className="flex items-center space-x-2"><Mail className="h-3 w-3 flex-shrink-0 text-primary" /><span className="truncate">{s.email || `${s.npsn || 'sekolah'}@survasi.com`}</span></div>
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
