/**
 * @module features/analisis/pages
 * @description Visualisasi funnel 5 tahap dari sasaran sampai implementasi penuh
 * @tables satuan_pendidikan, responden_survey, kecamatan, kabupaten
 * @queries database/queries/gap_funnel.sql → Funnel utama (5 tahap)
 * @api GET /api/analisis/funnel?kabupaten_id=
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { database, KABUPATEN_LIST } from '../../../shared/data/data-source';
import { Layers, HelpCircle, ArrowDownRight, CheckCircle, AlertCircle, Info, Filter } from 'lucide-react';
import AnimatedCounter from '../../../shared/components/AnimatedCounter';

import CustomSelect from '../../../shared/components/CustomSelect';

interface GapFunnelProps {
  activeKecamatan: string | null;
}

export default function GapFunnel({ activeKecamatan }: GapFunnelProps) {
  const [selectedKab, setSelectedKab] = useState<string>('');
  const [selectedKec, setSelectedKec] = useState<string>('');

  const { data: funnelSteps = [], isLoading } = useQuery({
    queryKey: ['funnelData', selectedKab, selectedKec, activeKecamatan],
    queryFn: () => database.getGapFunnelData({ kabupaten: selectedKab || undefined, kecamatan: selectedKec || activeKecamatan || undefined })
  });

  const kabOptions = [
    { value: '', label: 'Semua Wilayah Kabupaten' },
    ...KABUPATEN_LIST.map(k => ({ value: k.name, label: k.name }))
  ];

  return (
    <div className="space-y-6 animate-tab-content">
      {/* Header Banner */}
      <div className="card-premium p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                <Layers className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-extrabold font-display text-slate-900 tracking-tight">
                Analisis Gap Funnel Implementasi BSAN
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Memonitor konversi & rasio penyusutan (drop-off) dari total sasaran sekolah hingga kriteria mutu utama.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto min-w-[200px]">
            <CustomSelect
              options={kabOptions}
              value={selectedKab}
              onChange={(val) => { setSelectedKab(val); setSelectedKec(''); }}
              placeholder="Pilih Wilayah"
              size="md"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Funnel Chart Card */}
        <div className="lg:col-span-2 card-premium p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600" />
              <span>Diagram Corong Konversi (Gap Funnel)</span>
            </h3>
            <span className="text-xs font-extrabold text-indigo-600 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100 font-display">
              Target: 1.238 SD
            </span>
          </div>

          {isLoading ? (
            <div className="h-80 flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              Memuat data corong...
            </div>
          ) : (
            <div key={`funnel-${selectedKab}-${selectedKec}`} className="space-y-5 pt-2">
              {funnelSteps.map((step, idx) => {
                const widthPercent = Math.max(38, 100 - idx * 14);
                const prevStep = idx > 0 ? funnelSteps[idx - 1] : null;
                const dropOff = prevStep ? Math.round(((prevStep.schools - step.schools) / prevStep.schools) * 100) : 0;

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center gap-4">
                      <div className="w-48 text-right text-xs font-bold text-slate-800 leading-tight">
                        {step.name}
                      </div>

                      <div className="flex-1">
                        <div
                          className="relative flex h-12 items-center justify-between px-4 rounded-2xl text-white font-extrabold text-xs shadow-md transition-all duration-500 hover:scale-101 progress-bar-fill"
                          style={{
                            width: `${widthPercent}%`,
                            background:
                              idx === 0 ? 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)' :
                                idx === 1 ? 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)' :
                                  idx === 2 ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' :
                                    idx === 3 ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' :
                                      'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                          }}
                        >
                          <span className="truncate">
                            <AnimatedCounter key={`f-sch-${idx}`} value={step.schools} suffix=" Sekolah" />
                          </span>
                          <span className="font-display font-black text-sm">
                            <AnimatedCounter key={`f-pct-${idx}`} value={step.percentage} suffix="%" />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Drop-off rate indicator */}
                    {idx > 0 && (
                      <div className="flex items-center pl-52 text-[10px] text-rose-600 font-extrabold gap-1">
                        <ArrowDownRight className="h-3.5 w-3.5" />
                        <span>Penyusutan (Drop-off): {dropOff}% dari tahap sebelumnya</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actionable Recommendations */}
        <div className="card-premium p-6 space-y-5">
          <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2 border-b border-slate-200 pb-4">
            <HelpCircle className="h-5 w-5 text-indigo-600" />
            <span>Rekomendasi Tindak Lanjut</span>
          </h3>

          <div className="space-y-3.5 text-xs font-medium">
            <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 space-y-1">
              <p className="font-extrabold text-indigo-700 flex items-center gap-1.5 font-display text-xs">
                <Info className="h-4 w-4 text-indigo-600" />
                <span>Intervensi Tahap 1 & 2:</span>
              </p>
              <p className="text-slate-600 leading-relaxed">
                Prioritaskan reminder ke sekolah yang belum mengisi kuesioner di wilayah Sidoarjo, Batu, & Tuban.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-100 space-y-1">
              <p className="font-extrabold text-amber-700 flex items-center gap-1.5 font-display text-xs">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span>Pendampingan Modul 3:</span>
              </p>
              <p className="text-slate-600 leading-relaxed">
                Adakan sosialisasi KKG khusus mengenai supervisi klinis kepala sekolah.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100 space-y-1">
              <p className="font-extrabold text-emerald-700 flex items-center gap-1.5 font-display text-xs">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Apresiasi Kategori Utama:</span>
              </p>
              <p className="text-slate-600 leading-relaxed">
                Sekolah yang lulus kategori utama diberikan piagam penghargaan BSAN dari Dinas Pendidikan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
