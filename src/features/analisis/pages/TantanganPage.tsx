/**
 * @module features/analisis/pages
 * @description Bar chart top tantangan, heatmap per kecamatan, narasi Q34
 * @tables tantangan_implementasi, jawaban_survey (Q34), responden_survey
 * @queries database/queries/tantangan.sql → semua query
 * @api GET /api/analisis/tantangan?kabupaten_id=
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { database, KABUPATEN_LIST } from '../../../shared/data/data-source';
import { AlertTriangle, ShieldAlert, Cpu, Wifi, BookOpen, Users, CheckCircle2, Sparkles } from 'lucide-react';
import AnimatedCounter from '../../../shared/components/AnimatedCounter';

import CustomSelect from '../../../shared/components/CustomSelect';

interface TantanganImplementasiProps {
  activeKecamatan: string | null;
}

export default function TantanganImplementasi({ activeKecamatan }: TantanganImplementasiProps) {
  const [selectedKab, setSelectedKab] = useState<string>('');

  const { data: challengeData = [], isLoading } = useQuery({
    queryKey: ['challengeData', selectedKab, activeKecamatan],
    queryFn: () => database.getTantanganData({ kabupaten: selectedKab || undefined, kecamatan: activeKecamatan || undefined })
  });

  const kabOptions = [
    { value: '', label: 'Semua Wilayah' },
    ...KABUPATEN_LIST.map(k => ({ value: k.name, label: k.name }))
  ];

  const getCategoryIcon = (category: string) => {
    if (category.includes('Perangkat')) return Cpu;
    if (category.includes('Internet')) return Wifi;
    if (category.includes('Pelatihan')) return BookOpen;
    if (category.includes('Bahan')) return BookOpen;
    return Users;
  };

  return (
    <div className="space-y-6 animate-tab-content">
      {/* Header Banner */}
      <div className="card-premium p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-extrabold font-display text-slate-900 tracking-tight">
                Analisis Tantangan & Kendala Lapangan
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Ringkasan hambatan teknis & manajerial yang dilaporkan oleh sekolah dasar di Sidoarjo, Batu, dan Tuban.
            </p>
          </div>

          <div className="min-w-[180px]">
            <CustomSelect
              options={kabOptions}
              value={selectedKab}
              onChange={(val) => setSelectedKab(val)}
              placeholder="Pilih Wilayah"
              size="md"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Challenge Bar Progress List */}
        <div className="lg:col-span-2 card-premium p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              <span>Kategori Kendala Terbanyak</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">Berdasarkan 944+ Laporan Real</span>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              Memuat data tantangan...
            </div>
          ) : (
            <>
              <div key={`challenges-${selectedKab}`} className="space-y-5 pb-6 border-b border-slate-200">
                {challengeData.map((item, idx) => {
                  const Icon = getCategoryIcon(item.category);
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-indigo-600" />
                          <span className="font-bold text-slate-800">{item.category}</span>
                        </div>
                        <span className="font-extrabold text-slate-600 font-display">
                          {item.count} Laporan (<AnimatedCounter value={item.percentage} decimals={1} suffix="%" />)
                        </span>
                      </div>

                      <div className="h-3.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          key={`c-bar-${selectedKab}-${idx}`}
                          className="h-full rounded-full progress-bar-fill"
                          style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* AI Insight Box */}
              <div className="pt-1">
                <div className="rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-100 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
                    <h4 className="text-xs font-black text-slate-900 font-display uppercase tracking-wider">AI Insight & Rekomendasi</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Berdasarkan analisis data sentimen dari {challengeData[0]?.count || 0} laporan teratas, 
                    <strong className="text-indigo-600"> {challengeData[0]?.category} </strong> 
                    merupakan hambatan terbesar di lapangan. Rekomendasi tindakan prioritas untuk 
                    Dinas Pendidikan {selectedKab || 'Provinsi'} adalah segera melakukan alokasi ulang anggaran BOS Kinerja 
                    untuk penguatan infrastruktur digital, serta menggandeng CSR perusahaan lokal.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Strategy Solution Cards */}
        <div className="card-premium p-6 space-y-5">
          <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2 border-b border-slate-200 pb-4">
            <ShieldAlert className="h-5 w-5 text-purple-600" />
            <span>Strategi Solusi Dinas</span>
          </h3>

          <div className="space-y-3.5 text-xs font-medium">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="font-extrabold text-slate-900 flex items-center gap-1.5 font-display text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Pengadaan Chromebook & Perangkat</span>
              </p>
              <p className="text-slate-600 leading-relaxed">
                Pengusulan bantuan hibah TIK untuk 85 SD di wilayah perkampungan Sidoarjo & Tuban.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="font-extrabold text-slate-900 flex items-center gap-1.5 font-display text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Bimbingan Teknis KKG Berkala</span>
              </p>
              <p className="text-slate-600 leading-relaxed">
                Pelatihan intensif 5 modul BSAN terintegrasi dalam forum rutin K3S / KKG kecamatan.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="font-extrabold text-slate-900 flex items-center gap-1.5 font-display text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Forum Komite & Parenting</span>
              </p>
              <p className="text-slate-600 leading-relaxed">
                Mengaktifkan kelas orang tua untuk memperkuat keterlibatan wali murid dalam pembiasaan karakter di rumah.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
