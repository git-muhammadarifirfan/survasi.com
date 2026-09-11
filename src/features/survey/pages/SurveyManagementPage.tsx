/**
 * @module features/survey/pages
 * @description Survey Management Page — Admin Only for managing BSAN Survey questions and active parameters
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, CheckCircle2, Sliders, Layers, FileText, Settings, ShieldCheck } from 'lucide-react';
import { apiClient } from '../../../shared/services/api-client';
import ThreeDotsLoader from '../../../shared/components/ThreeDotsLoader';

export default function SurveyManagementPage() {
  const [selectedSection, setSelectedSection] = useState<string>('semua');

  // Static list of survey question overview (or API fetched)
  const sections = [
    { id: 'semua', label: 'Semua Section (37 Questions)' },
    { id: 'identitas', label: '1. Identitas Responden' },
    { id: 'pelatihan', label: '2. Pelatihan & Penerimaan Modul' },
    { id: 'implementasi_awal', label: '3. Implementasi Kelas Awal (1-3)' },
    { id: 'implementasi_tinggi', label: '4. Implementasi Kelas Tinggi (4-6)' },
    { id: 'refleksi', label: '5. Refleksi & Tantangan Lapangan' },
    { id: 'kepala_sekolah', label: '6. Evaluasi Kepala Sekolah' },
  ];

  const questionsList = [
    { id: 1, kode: 'Q1', section: 'identitas', teks: 'Nama Lengkap Responden (Huruf Kapital)', tipe: 'text', active: true },
    { id: 2, kode: 'Q2', section: 'identitas', teks: 'Jenis Kelamin', tipe: 'radio', active: true },
    { id: 3, kode: 'Q3', section: 'identitas', teks: 'Jabatan / Posisi di Sekolah', tipe: 'dropdown', active: true },
    { id: 4, kode: 'Q4', section: 'identitas', teks: 'Nama Satuan Pendidikan (Sekolah)', tipe: 'dropdown', active: true },
    { id: 5, kode: 'Q5', section: 'pelatihan', teks: 'Apakah Anda telah menerima materi/modul BSAN?', tipe: 'radio', active: true },
    { id: 6, kode: 'Q6', section: 'pelatihan', teks: 'Penyelenggara Pelatihan yang pernah Anda ikuti', tipe: 'checkbox', active: true },
    { id: 7, kode: 'Q7', section: 'implementasi_awal', teks: 'Penggunaan Alur & Tema Modul With Myself pada Kelas Awal', tipe: 'scale', active: true },
    { id: 8, kode: 'Q8', section: 'implementasi_tinggi', teks: 'Penggunaan Alur & Tema Modul With Our Challenges pada Kelas Tinggi', tipe: 'scale', active: true },
    { id: 9, kode: 'Q34', section: 'refleksi', teks: 'Kendala / Tantangan Utama dalam Implementasi Modul BSAN', tipe: 'text', active: true },
    { id: 10, kode: 'Q35', section: 'refleksi', teks: 'Rekomendasi / Suara Responden untuk Penguatan Mutu', tipe: 'text', active: true },
  ];

  const filteredQuestions = selectedSection === 'semua'
    ? questionsList
    : questionsList.filter(q => q.section === selectedSection);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-soft">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold font-display text-text-primary">Manajemen Survey BSAN</h1>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Pengaturan parameter pertanyaan, urutan, serta keaktifan instrumen survei BSAN.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-200 text-xs font-bold">
            <ShieldCheck className="h-4 w-4" />
            <span>Form Active Version 1.0</span>
          </span>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 custom-scrollbar">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedSection(s.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedSection === s.id
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-surface text-text-secondary hover:bg-bg border border-border'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Questions Overview List */}
      <div className="rounded-2xl bg-surface border border-border shadow-soft p-6 space-y-4">
        <h2 className="text-sm font-bold text-text-primary flex items-center space-x-2">
          <Sliders className="h-4 w-4 text-accent" />
          <span>Daftar Pertanyaan Survey ({filteredQuestions.length})</span>
        </h2>

        <div className="divide-y divide-border">
          {filteredQuestions.map((q) => (
            <div key={q.id} className="py-3.5 flex items-center justify-between gap-4 hover:bg-bg/40 px-2 rounded-xl transition-colors">
              <div className="flex items-start space-x-3">
                <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary font-bold font-mono text-xs">
                  {q.kode}
                </span>
                <div>
                  <p className="text-xs font-bold text-text-primary">{q.teks}</p>
                  <div className="flex items-center space-x-2 mt-1 text-[10px] text-text-secondary">
                    <span>Tipe Input: <strong className="uppercase">{q.tipe}</strong></span>
                    <span>•</span>
                    <span>Section: <strong className="capitalize">{q.section.replace('_', ' ')}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-200">
                  Aktif
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
