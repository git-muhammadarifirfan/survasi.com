/**
 * @module features/analisis/pages
 * @description Framework Modul BSAN — 3 Frameworks (With Myself, With Others, With Our Challenges) + 5 Sub-Modul Real-Time DB Analysis
 * @tables bsan_frameworks, modul_bsan, pertanyaan_survey, jawaban_survey, responden_survey
 * @api GET /api/analisis/frameworks, GET /api/analisis/modul-breakdown
 */

import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { database, KABUPATEN_LIST } from '../../../shared/data/data-source';
import {
  BSAN_MODUL_LABEL, BSAN_MODUL_LABEL_ID,
  BSAN_MODUL_SUBTITLE, BSAN_MODUL_SUBTITLE_ID, BSAN_MODUL_COLOR,
  SEL_DIMENSI_LABEL, SURVEY_TEMA_TO_MODUL,
  getGeneralSkillsByModul, getDimensiByModul,
  SEL_INDIKATORS,
} from '../../../shared/data/sel-indicators';
import type { BSANModul, BSANGeneralSkill, SELDimensi } from '../../../shared/data/sel-indicators';
import {
  Brain, Users, Target, ChevronDown, Download, FileText, File,
  BookOpen, Sparkles, CheckCircle2, Eye, Loader2
} from 'lucide-react';
import AnimatedCounter from '../../../shared/components/AnimatedCounter';
import html2pdf from 'html2pdf.js';
import { apiClient } from '../../../shared/services/api-client';
import CustomSelect from '../../../shared/components/CustomSelect';

/* ─── Icon Map ─── */
const FRAMEWORK_ICONS: Record<string, typeof Brain> = {
  with_myself: Brain,
  with_others: Users,
  with_challenges: Target,
};

const FRAMEWORK_COLORS: Record<string, string> = {
  with_myself: '#5468d4',
  with_others: '#10B981',
  with_challenges: '#F59E0B',
};

const FRAMEWORK_META: Record<string, { title: string; subtitle: string; desc: string }> = {
  with_myself: {
    title: 'With Myself',
    subtitle: 'Dengan Diriku • Memahami dan mengelola emosi',
    desc: 'Fokus pada kesadaran diri, regulasi emosi, literasi dasar, dan pengembangan karakter.',
  },
  with_others: {
    title: 'With Others',
    subtitle: 'Dengan Orang Lain • Disiplin positif & kemitraan',
    desc: 'Fokus pada budaya anti-perundungan, kesepakatan kelas, serta kemitraan paguyuban orang tua & komite.',
  },
  with_challenges: {
    title: 'With Our Challenges',
    subtitle: 'Dengan Tantangan Kita • Pengelolaan iklim & lingkungan',
    desc: 'Fokus pada refleksi emosi, fasilitas kebersihan sanitasi, serta kebersihan & kesehatan lingkungan sekolah.',
  },
};

/* ─── Color helpers ─── */
const DIMENSI_DOT: Record<SELDimensi, string> = {
  kesadaran_diri: '#4A57C4',
  regulasi_emosi: '#10B981',
  kesadaran_sosial: '#F59E0B',
  keterampilan_relasi: '#8B5CF6',
  tanggung_jawab: '#EF4444',
};

/* ────────────────────────────────────────────────────── */
/*  Export helpers                                        */
/* ────────────────────────────────────────────────────── */

async function exportPDF(el: HTMLElement, title: string) {
  try {
    const opt = {
      margin: [12, 10, 12, 10],
      filename: `${title.replace(/\s/g, '_')}_Summary.pdf`,
      image: { type: 'jpeg', quality: 0.96 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };
    await html2pdf().set(opt).from(el).save();
  } catch (err) {
    console.error('Failed to export PDF via html2pdf, falling back to window.print', err);
    window.print();
  }
}

async function exportDOCX(
  modul: BSANModul,
  skills: BSANGeneralSkill[],
  indicatorCounts: { label: string; guru: number; murid: number; total: number }[],
  kelasAwalTemas: readonly string[],
  kelasTinggiTemas: readonly string[],
  progres: number,
  kabupaten: string,
) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, TableRow, TableCell, Table, WidthType, BorderStyle, AlignmentType } = await import('docx');
  const { saveAs } = await import('file-saver');

  const label = BSAN_MODUL_LABEL[modul];
  const labelId = BSAN_MODUL_LABEL_ID[modul];
  const subtitle = BSAN_MODUL_SUBTITLE[modul];
  const subtitleId = BSAN_MODUL_SUBTITLE_ID[modul];

  const borderNone = { top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' } };

  const children: any[] = [
    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { after: 200 }, children: [new TextRun({ text: `Framework Modul BSAN – ${label}`, bold: true, size: 28 })] }),
    new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: `${labelId} • ${subtitle}`, italics: true, color: '666666', size: 20 })] }),
    new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: subtitleId, italics: true, color: '888888', size: 20 })] }),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Kabupaten: ${kabupaten}  |  Progres Implementasi: ${progres}%`, bold: true, size: 20 })] }),
    new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: '━'.repeat(60), color: 'CCCCCC', size: 16 })] }),
  ];

  skills.forEach((gs, idx) => {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 }, children: [new TextRun({ text: `${idx + 1}. ${gs.name} (${gs.nameId})`, bold: true, size: 24 })] }));
    children.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: gs.descriptionId, italics: true, color: '555555', size: 20 })] }));

    gs.specificSkills.forEach(ss => {
      children.push(new Paragraph({ spacing: { after: 40 }, indent: { left: 400 }, bullet: { level: 0 }, children: [new TextRun({ text: `${ss.name} (${ss.nameId})`, bold: true, size: 20 })] }));
      children.push(new Paragraph({ spacing: { after: 80 }, indent: { left: 700 }, children: [new TextRun({ text: ss.descriptionId, color: '666666', size: 18 })] }));
    });
  });

  children.push(new Paragraph({ spacing: { before: 300, after: 60 }, children: [new TextRun({ text: '━'.repeat(60), color: 'CCCCCC', size: 16 })] }));
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { after: 120 }, children: [new TextRun({ text: 'Dimensi Observasi SEL', bold: true, size: 24 })] }));

  const headerRow = new TableRow({ children: ['Dimensi', 'Guru', 'Murid', 'Total'].map(h => new TableCell({ borders: borderNone, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, size: 18 })] })] })) });
  const dataRows = indicatorCounts.map(ic => new TableRow({ children: [ic.label, String(ic.guru), String(ic.murid), String(ic.total)].map((v, ci) => new TableCell({ borders: borderNone, children: [new Paragraph({ alignment: ci === 0 ? AlignmentType.LEFT : AlignmentType.CENTER, children: [new TextRun({ text: v, size: 18 })] })] })) }));

  children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...dataRows] }));

  children.push(new Paragraph({ spacing: { before: 300, after: 60 }, children: [new TextRun({ text: '━'.repeat(60), color: 'CCCCCC', size: 16 })] }));
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { after: 120 }, children: [new TextRun({ text: 'Tema Modul dalam Survei Kuesioner', bold: true, size: 24 })] }));

  if (kelasAwalTemas.length) {
    children.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: 'Kelas Awal (1–3)', bold: true, size: 20 })] }));
    kelasAwalTemas.forEach(t => children.push(new Paragraph({ spacing: { after: 40 }, indent: { left: 400 }, bullet: { level: 0 }, children: [new TextRun({ text: t, size: 18 })] })));
  }
  if (kelasTinggiTemas.length) {
    children.push(new Paragraph({ spacing: { before: 120, after: 80 }, children: [new TextRun({ text: 'Kelas Tinggi (4–6)', bold: true, size: 20 })] }));
    kelasTinggiTemas.forEach(t => children.push(new Paragraph({ spacing: { after: 40 }, indent: { left: 400 }, bullet: { level: 0 }, children: [new TextRun({ text: t, size: 18 })] })));
  }

  children.push(new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: `Diekspor pada ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, color: '999999', italics: true, size: 16 })] }));

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${label.replace(/\s/g, '_')}_Summary.docx`);
}

/* ────────────────────────────────────────────────────── */
/*  Section Components                                    */
/* ────────────────────────────────────────────────────── */

function SkillCard({ gs, index, color }: { gs: BSANGeneralSkill; index: number; color: string }) {
  return (
    <div className="rounded-2xl bg-surface border border-border shadow-card animate-slide-up" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="p-5 pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white" style={{ backgroundColor: color }}>
            {index + 1}
          </span>
          <div className="min-w-0">
            <h4 className="font-bold text-text-primary text-[13px] leading-tight">{gs.name}</h4>
            <p className="text-[10px] text-text-secondary mt-0.5 font-medium">{gs.nameId} • {gs.descriptionId}</p>
          </div>
        </div>
      </div>

      <div className="p-5 pt-4">
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles className="h-3.5 w-3.5" style={{ color }} />
          <span className="text-[9px] font-bold uppercase tracking-[0.08em]" style={{ color }}>Specific Skills</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {gs.specificSkills.map((ss, i) => (
            <div
              key={i}
              className="p-3 rounded-xl border border-border/40 bg-bg/40 hover:bg-bg/80 hover:border-border transition-all group"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[11px] font-bold text-text-primary leading-tight">{ss.name}</span>
              </div>
              <p className="text-[10px] text-text-secondary leading-relaxed">{ss.nameId}</p>
              <p className="text-[10px] text-text-secondary/70 leading-relaxed mt-1 italic">{ss.descriptionId}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DimensiRow({ label, guru, murid, total, color }: { label: string; guru: number; murid: number; total: number; color: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
      <div className="flex items-center gap-2.5">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-xs font-semibold text-text-primary">{label}</span>
      </div>
      <div className="flex items-center gap-4 text-[11px]">
        <div className="text-center">
          <span className="text-text-secondary">Guru </span>
          <span className="font-bold text-primary">{guru}</span>
        </div>
        <div className="text-center">
          <span className="text-text-secondary">Murid </span>
          <span className="font-bold text-accent">{murid}</span>
        </div>
        <span className="font-bold text-text-primary bg-bg border border-border/50 rounded-md px-2 py-0.5 text-[10px] min-w-[28px] text-center">{total}</span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────── */
/*  Main Page Component                                   */
/* ────────────────────────────────────────────────────── */

export default function ModulBsan() {
  const [activeFrameworkKey, setActiveFrameworkKey] = useState<string>('with_myself');
  const [breakdownTab, setBreakdownTab] = useState<number>(1);
  const [kabupaten, setKabupaten] = useState('Kab. Sidoarjo');
  const [exportMenu, setExportMenu] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const selectedKab = KABUPATEN_LIST.find(k => k.name === kabupaten || k.id === kabupaten);
  const kabIdNumber = selectedKab?.id === 'Kab. Sidoarjo' ? 1 : selectedKab?.id === 'Kab. Gresik' ? 2 : selectedKab?.id === 'Kab. Sampang' ? 3 : undefined;

  // Query 3 Frameworks Data from DB
  const { data: frameworksResponse } = useQuery({
    queryKey: ['frameworksData', kabupaten],
    queryFn: () => apiClient.analisis.getFrameworks(kabIdNumber),
  });

  const { data: breakdownResponse } = useQuery({
    queryKey: ['modulBreakdown', kabupaten],
    queryFn: () => apiClient.analisis.getModulBreakdown(kabIdNumber),
  });

  const frameworksList = frameworksResponse?.data || [
    { framework_key: 'with_myself', nama: 'With Myself', nama_id: 'Dengan Diriku', progres: 34 },
    { framework_key: 'with_others', nama: 'With Others', nama_id: 'Dengan Orang Lain', progres: 34 },
    { framework_key: 'with_challenges', nama: 'With Our Challenges', nama_id: 'Dengan Tantangan Kita', progres: 33 },
  ];

  const currentFramework = frameworksList.find(f => f.framework_key === activeFrameworkKey) || frameworksList[0];

  const liveBreakdownMap = breakdownResponse?.data || {};

  const activeBreakdown = liveBreakdownMap[breakdownTab] || {
    title: `MODUL ${breakdownTab}: ${breakdownTab === 1 ? 'LITERASI & NUMERASI DASAR' : breakdownTab === 2 ? 'DISIPLIN POSITIF & ANTIPERUNDUNGAN' : breakdownTab === 3 ? 'KESEHATAN EMOSI & PENGELOLAAN STRES' : breakdownTab === 4 ? 'KEBERSIHAN & KESEHATAN LINGKUNGAN' : 'KEMITRAAN ORANG TUA & KOMITE'}`,
    progres: breakdownTab === 1 ? '62%' : breakdownTab === 2 ? '45%' : breakdownTab === 3 ? '36%' : breakdownTab === 4 ? '42%' : '28%',
    questions: [],
  };

  const bsanModulKey: BSANModul = activeFrameworkKey as BSANModul;
  const color = FRAMEWORK_COLORS[activeFrameworkKey] || '#5468d4';
  const Icon = FRAMEWORK_ICONS[activeFrameworkKey] || Brain;
  const skills = getGeneralSkillsByModul(bsanModulKey);
  const dims = getDimensiByModul(bsanModulKey);
  const numericProg = parseInt(String(activeBreakdown.progres || '34').replace('%', '')) || 34;

  const indicatorCounts = dims.map(d => ({
    dimensi: d,
    label: SEL_DIMENSI_LABEL[d],
    guru: SEL_INDIKATORS.filter(i => i.dimensi === d && i.subjek === 'guru').length,
    murid: SEL_INDIKATORS.filter(i => i.dimensi === d && i.subjek === 'murid').length,
    total: SEL_INDIKATORS.filter(i => i.dimensi === d).length,
  }));

  const kelasAwal = SURVEY_TEMA_TO_MODUL.kelasAwal[bsanModulKey] || [];
  const kelasTinggi = SURVEY_TEMA_TO_MODUL.kelasTinggi[bsanModulKey] || [];

  const regionOptions = KABUPATEN_LIST.map(k => ({
    value: k.id,
    label: k.name,
    icon: <span className="w-2.5 h-2.5 rounded-full shrink-0 inline-block" style={{ backgroundColor: k.color }} />
  }));

  const handleExport = async (format: 'pdf' | 'docx') => {
    setExportMenu(false);
    setExporting(format);
    try {
      if (format === 'pdf' && printRef.current) {
        await exportPDF(printRef.current, `Framework_${activeFrameworkKey}_${kabupaten}`);
      } else {
        await exportDOCX(bsanModulKey, skills, indicatorCounts, kelasAwal, kelasTinggi, numericProg, kabupaten);
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(null);
    }
  };

  const moduleMapFramework: Record<number, string> = {
    1: 'with_myself',
    2: 'with_others',
    3: 'with_challenges',
    4: 'with_challenges',
    5: 'with_others',
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* ─── Printable Content ─── */}
      <div ref={printRef} id="modul-bsan-content" className="space-y-5">
        {/* ─── CARD 1: Framework Modul BSAN Header (Exact matching sample UI) ─── */}
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50/80 rounded-2xl text-indigo-600 border border-indigo-100/60">
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display text-slate-900 leading-tight">Framework Modul BSAN</h2>
                <p className="text-xs text-slate-500 mt-0.5">Social-Emotional Learning • CASEL Framework</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-44 sm:w-48">
                <CustomSelect
                  options={regionOptions}
                  value={kabupaten}
                  onChange={(val) => setKabupaten(val)}
                  size="sm"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setExportMenu(!exportMenu)}
                  disabled={!!exporting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5468d4] hover:bg-[#4556b8] text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-60"
                >
                  {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  <span>Export</span>
                </button>
                {exportMenu && (
                  <div className="absolute right-0 top-full mt-2 z-30 w-52 rounded-xl bg-white border border-slate-200 shadow-lg py-1 animate-scale-in">
                    <button onClick={() => handleExport('pdf')} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                      <FileText className="h-4 w-4 text-red-500" />
                      <div className="text-left"><div className="font-bold">Export PDF</div><div className="text-[9px] text-slate-400">Dokumen visual</div></div>
                    </button>
                    <button onClick={() => handleExport('docx')} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                      <File className="h-4 w-4 text-blue-500" />
                      <div className="text-left"><div className="font-bold">Export DOCX</div><div className="text-[9px] text-slate-400">Dokumen Word</div></div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3 Framework Pill Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {frameworksList.map(fw => {
              const isActive = activeFrameworkKey === fw.framework_key;
              const FwIcon = FRAMEWORK_ICONS[fw.framework_key] || Brain;

              return (
                <button
                  key={fw.framework_key}
                  type="button"
                  onClick={() => {
                    setActiveFrameworkKey(fw.framework_key);
                    if (fw.framework_key === 'with_myself') setBreakdownTab(1);
                    else if (fw.framework_key === 'with_others' && (breakdownTab !== 2 && breakdownTab !== 5)) setBreakdownTab(2);
                    else if (fw.framework_key === 'with_challenges' && (breakdownTab !== 3 && breakdownTab !== 4)) setBreakdownTab(3);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-[#5468d4] text-white border-[#5468d4] shadow-md shadow-indigo-500/20'
                      : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <FwIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className={`font-bold text-xs leading-tight truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>
                        {fw.nama}
                      </h3>
                      <p className={`text-[10px] truncate mt-0.5 font-medium ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                        {fw.nama_id}
                      </p>
                    </div>
                  </div>

                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${
                    isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                  }`}>
                    {fw.progres}%
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── CARD 2: Hero Blue Banner (Exact matching sample UI) ─── */}
        <div className="rounded-2xl p-4 md:p-5 text-white bg-[#5468d4] shadow-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display text-white leading-tight">
                  {currentFramework?.nama || 'With Myself'}
                </h2>
                <p className="text-white/80 text-xs mt-0.5">
                  {currentFramework?.nama_id || 'Dengan Diriku'} • {FRAMEWORK_META[activeFrameworkKey]?.subtitle || 'Memahami dan mengelola emosi'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {frameworksList.map(fw => {
                const FwIcon = FRAMEWORK_ICONS[fw.framework_key] || Brain;
                const active = activeFrameworkKey === fw.framework_key;
                return (
                  <button
                    key={fw.framework_key}
                    onClick={() => {
                      setActiveFrameworkKey(fw.framework_key);
                      if (fw.framework_key === 'with_myself') setBreakdownTab(1);
                      else if (fw.framework_key === 'with_others' && (breakdownTab !== 2 && breakdownTab !== 5)) setBreakdownTab(2);
                      else if (fw.framework_key === 'with_challenges' && (breakdownTab !== 3 && breakdownTab !== 4)) setBreakdownTab(3);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      active ? 'bg-white/25 border border-white/40 text-white shadow-xs' : 'bg-white/10 hover:bg-white/20 text-white/80'
                    }`}
                  >
                    <FwIcon className="h-3.5 w-3.5" />
                    <span>{fw.progres}%</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── CARD 3: Main 2-Column Grid (Exact matching sample UI) ─── */}
        <div key={`${activeFrameworkKey}-${kabupaten}`} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ── LEFT: Analisis Kuesioner Responden (8 cols) ── */}
          <div className="lg:col-span-8 space-y-5">
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs p-6 space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                  <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
                    ANALISIS KUESIONER RESPONDEN
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">Breakdown Hasil Per Modul BSAN</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Analisis detail jawaban terstruktur responden berdasarkan modul instrumen survei.</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 shrink-0 self-start sm:self-auto">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                  <span className="text-xs font-bold text-slate-800">{kabupaten}</span>
                </div>
              </div>

              {/* 5 Module Tabs (Modul 1 - Modul 5) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { id: 1, name: 'Modul 1', defaultPct: '62%' },
                  { id: 2, name: 'Modul 2', defaultPct: '45%' },
                  { id: 3, name: 'Modul 3', defaultPct: '36%' },
                  { id: 4, name: 'Modul 4', defaultPct: '42%' },
                  { id: 5, name: 'Modul 5', defaultPct: '28%' },
                ].map(m => {
                  const active = breakdownTab === m.id;
                  const mProgress = liveBreakdownMap[m.id]?.progres || m.defaultPct;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setBreakdownTab(m.id);
                        const targetFw = moduleMapFramework[m.id];
                        if (targetFw) setActiveFrameworkKey(targetFw);
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${active
                        ? 'bg-[#5468d4] text-white border-[#5468d4] shadow-md shadow-indigo-500/20 font-bold scale-[1.02]'
                        : 'bg-white text-slate-600 border-slate-200/80 hover:border-slate-300'
                        }`}
                    >
                      <div className="text-xs font-bold">{m.name}</div>
                      <div className={`text-[11px] mt-0.5 font-medium ${active ? 'text-white/90' : 'text-slate-400'}`}>{mProgress}</div>
                    </button>
                  );
                })}
              </div>

              {/* Active Module Title & Capaian */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    {activeBreakdown.title || `MODUL ${breakdownTab}`}
                  </h4>
                  <span className="text-xs font-bold text-slate-600">Capaian: <strong className="text-indigo-600">{activeBreakdown.progres}</strong></span>
                </div>

                {/* Questions List */}
                {!activeBreakdown.questions || activeBreakdown.questions.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                    <p className="text-xs text-slate-500 font-medium">Belum ada pertanyaan kuesioner yang dipetakan ke modul ini.</p>
                  </div>
                ) : (
                  activeBreakdown.questions.map((item: any, qIdx: number) => (
                    <div key={item.id || qIdx} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-bold text-indigo-600 shrink-0 w-5 leading-relaxed">
                          {qIdx + 1}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900 leading-relaxed flex-1">
                          {item.q}
                        </h5>
                      </div>

                      {/* Options */}
                      <div className="space-y-3.5 pl-8">
                        {item.options && item.options.length > 0 ? (
                          item.options.map((opt: any, oi: number) => {
                            const optColors = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899'];
                            const barColor = opt.color || optColors[oi % optColors.length];
                            return (
                              <div key={oi} className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-semibold text-slate-800">{opt.label}</span>
                                  <span className="font-bold text-slate-800 ml-2">{opt.percent}%</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-slate-200/60 overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{ width: `${opt.percent}%`, backgroundColor: barColor }}
                                  />
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-xs text-slate-400 italic">Pertanyaan esai / isian bebas.</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Sidebar (4 cols) ── */}
          <div className="lg:col-span-4 space-y-4">
            {/* Card 1: PROGRES IMPLEMENTASI */}
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs p-5">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">PROGRES IMPLEMENTASI</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-black font-display text-indigo-600">
                  <AnimatedCounter key={`p-${activeFrameworkKey}-${breakdownTab}-${kabupaten}`} value={numericProg} suffix="%" />
                </span>
                <span className="text-xs text-slate-400 font-medium">dari target 100%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-indigo-600 transition-all duration-700" style={{ width: `${numericProg}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Card 2: DIMENSI OBSERVASI SEL */}
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs p-5 space-y-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Eye className="h-4 w-4 text-indigo-600" />
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DIMENSI OBSERVASI SEL</h3>
              </div>
              <div className="space-y-2">
                {indicatorCounts.map(ic => (
                  <DimensiRow
                    key={ic.dimensi}
                    label={ic.label}
                    guru={ic.guru}
                    murid={ic.murid}
                    total={ic.total}
                    color={DIMENSI_DOT[ic.dimensi]}
                  />
                ))}
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500 font-medium">
                <span>Total Indikator</span>
                <span className="font-bold text-slate-800">{indicatorCounts.reduce((s, c) => s + c.total, 0)}</span>
              </div>
            </div>

            {/* Card 3: TEMA KUESIONER SURVEI */}
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs p-5">
              <div className="flex items-center gap-1.5 mb-3">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TEMA KUESIONER SURVEI</h3>
              </div>

              {/* Kelas Awal */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-800">Kelas Awal (1–3)</span>
                  <span className="text-xs font-bold text-emerald-600 ml-auto">{kelasAwal.length}</span>
                </div>
                <div className="space-y-1.5 pl-3">
                  {kelasAwal.map((t, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-slate-500">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-snug">{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kelas Tinggi */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  <span className="text-xs font-bold text-slate-800">Kelas Tinggi (4–6)</span>
                  <span className="text-xs font-bold text-indigo-600 ml-auto">{kelasTinggi.length}</span>
                </div>
                <div className="space-y-1.5 pl-3">
                  {kelasTinggi.map((t, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-slate-500">
                      <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── BOTTOM SECTION: Rincian Kompetensi SEL (General & Specific Skills Mapped) ─── */}
        <div className="mt-10 pt-8 border-t border-slate-200 space-y-5 animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[11px] font-bold uppercase tracking-wider mb-1">
              Kerangka Kerja CASEL SEL
            </div>
            <h3 className="text-lg font-bold font-display text-slate-900">Detail Skills & Kompetensi SEL Framework</h3>
            <p className="text-xs text-slate-500">Rincian General Skills dan Specific Skills yang dikembangkan pada {currentFramework.nama}.</p>
          </div>

          <div className="space-y-4">
            {skills.map((gs, idx) => (
              <SkillCard key={gs.id} gs={gs} index={idx} color={color} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
