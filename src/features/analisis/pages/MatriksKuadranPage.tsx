/**
 * @module features/analisis/pages
 * @description Scatter plot 4 kuadran (penerimaan vs implementasi per kecamatan)
 * @tables responden_survey, kecamatan, kabupaten, satuan_pendidikan
 * @queries database/queries/matriks_kuadran.sql → semua query
 * @api GET /api/analisis/matriks?kabupaten_id=
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { database, KABUPATEN_LIST } from '../../../shared/data/data-source';
import type { MatrixPoint } from '../../../shared/data/data-source';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis } from 'recharts';
import { Grid3X3, Building2, X, Search } from 'lucide-react';
import AnimatedCounter from '../../../shared/components/AnimatedCounter';

import CustomSelect from '../../../shared/components/CustomSelect';

interface MatriksKuadranProps {
  activeKecamatan: string | null;
}

export default function MatriksKuadran({ activeKecamatan }: MatriksKuadranProps) {
  const [selectedKab, setSelectedKab] = useState<string>('');
  const [selectedPoint, setSelectedPoint] = useState<MatrixPoint | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: matrixData = [], isLoading } = useQuery({
    queryKey: ['matrixData', selectedKab, activeKecamatan],
    queryFn: () => database.getMatriksKuadranData({ kabupaten: selectedKab || undefined, kecamatan: activeKecamatan || undefined })
  });

  const kabOptions = [
    { value: '', label: 'Semua Wilayah' },
    ...KABUPATEN_LIST.map(k => ({ value: k.name, label: k.name }))
  ];

  const q1 = matrixData.filter(p => p.implementation >= 60 && p.readiness >= 60).length;
  const q2 = matrixData.filter(p => p.implementation < 60 && p.readiness >= 60).length;
  const q3 = matrixData.filter(p => p.implementation >= 60 && p.readiness < 60).length;
  const q4 = matrixData.filter(p => p.implementation < 60 && p.readiness < 60).length;

  const getPointColor = (p: MatrixPoint) => {
    if (p.implementation >= 60 && p.readiness >= 60) return '#10B981';
    if (p.implementation < 60 && p.readiness >= 60) return '#4F46E5';
    if (p.implementation >= 60 && p.readiness < 60) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="space-y-6 animate-tab-content">
      {/* Header Banner */}
      <div className="card-premium p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                <Grid3X3 className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-extrabold font-display text-slate-900 tracking-tight">
                Matriks Evaluasi 4 Kuadran BSAN
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Menentukan posisi kesiapan (X) vs tingkat implementasi (Y) sekolah sasaran di Sidoarjo, Batu, dan Tuban.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-60">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari NPSN atau Nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="min-w-[170px]">
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
      </div>

      {/* Quadrant Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-premium p-5 border-emerald-200">
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Kuadran I (Mandiri)</span>
          <h3 className="text-2xl font-black font-display text-emerald-600 mt-1">
            <AnimatedCounter value={q1} suffix=" SD" />
          </h3>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Implementasi & Kesiapan Tinggi</p>
        </div>

        <div className="card-premium p-5 border-indigo-200">
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Kuadran II (Potensial)</span>
          <h3 className="text-2xl font-black font-display text-indigo-600 mt-1">
            <AnimatedCounter value={q2} suffix=" SD" />
          </h3>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Kesiapan Tinggi, Impl. Sedang</p>
        </div>

        <div className="card-premium p-5 border-amber-200">
          <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider">Kuadran III (Perlu Sarana)</span>
          <h3 className="text-2xl font-black font-display text-amber-600 mt-1">
            <AnimatedCounter value={q3} suffix=" SD" />
          </h3>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Impl. Tinggi, Perangkat Kurang</p>
        </div>

        <div className="card-premium p-5 border-rose-200">
          <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider">Kuadran IV (Intervensi)</span>
          <h3 className="text-2xl font-black font-display text-rose-600 mt-1">
            <AnimatedCounter value={q4} suffix=" SD" />
          </h3>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Perlu Pendampingan Khusus</p>
        </div>
      </div>

      {/* Scatter Chart */}
      <div className="card-premium p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-indigo-600" />
            <span>Plot Matriks Posisi Sekolah</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">Klik pada titik untuk melihat detail sekolah</span>
        </div>

        {isLoading ? (
          <div className="h-96 flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            Memuat matriks kuadran...
          </div>
        ) : (
          <div className="h-[430px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  type="number"
                  dataKey="readiness"
                  name="Kesiapan (X)"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  label={{ value: 'Tingkat Kesiapan Sarana (X)', position: 'bottom', offset: 0, fontSize: 11, fill: '#64748B' }}
                />
                <YAxis
                  type="number"
                  dataKey="implementation"
                  name="Implementasi (Y)"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  label={{ value: 'Tingkat Implementasi Modul (Y)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748B' }}
                />
                <ZAxis range={[60, 60]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: 16,
                    color: '#FFFFFF',
                    fontSize: 12,
                  }}
                  formatter={(value: any, name: any) => [
                    `${value}%`,
                    name === 'readiness' ? 'Kesiapan' : 'Implementasi'
                  ]}
                />
                <Scatter
                  name="Sekolah"
                  data={matrixData}
                  onClick={(p) => setSelectedPoint(p as unknown as MatrixPoint)}
                  isAnimationActive={true}
                  animationDuration={800}
                >
                  {matrixData.map((entry, index) => {
                    const isMatched = searchTerm && entry.name.toLowerCase().includes(searchTerm.toLowerCase());
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={getPointColor(entry)}
                        stroke={isMatched ? '#4F46E5' : 'none'}
                        strokeWidth={isMatched ? 3 : 0}
                        opacity={searchTerm ? (isMatched ? 1 : 0.2) : 1}
                        className="cursor-pointer transition-all hover:scale-125"
                        r={isMatched ? 7 : 5}
                      />
                    );
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedPoint && (
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex justify-between items-start text-xs animate-tab-content">
            <div className="space-y-1">
              <span className="font-extrabold text-indigo-700 flex items-center gap-1.5 font-display text-sm">
                <Building2 className="h-4 w-4" />
                <span>{selectedPoint.name}</span>
              </span>
              <p className="text-slate-600 font-medium">Kecamatan: {selectedPoint.kecamatan}</p>
              <div className="flex gap-4 pt-1 font-bold text-slate-800">
                <span>Kesiapan: {selectedPoint.readiness}%</span>
                <span>Implementasi: {selectedPoint.implementation}%</span>
              </div>
            </div>
            <button onClick={() => setSelectedPoint(null)} className="text-slate-400 hover:text-slate-900 p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
