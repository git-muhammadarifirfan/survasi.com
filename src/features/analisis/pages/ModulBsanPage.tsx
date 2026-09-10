/**
 * @module features/analisis/pages
 * @description Ring chart progres per modul BSAN (formula: 40% base + 30% impl + 30% SEL)
 * @tables modul_bsan, responden_survey, sel_jawaban_observasi, sel_dimensi
 * @queries database/queries/modul_bsan.sql → semua query
 * @api GET /api/analisis/modul-progress?kabupaten_id=
 */

import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { database, KABUPATEN_LIST } from '../../../shared/data/data-source';
import {
  BSAN_MODUL_ORDER, BSAN_MODUL_LABEL, BSAN_MODUL_LABEL_ID,
  BSAN_MODUL_SUBTITLE, BSAN_MODUL_SUBTITLE_ID, BSAN_MODUL_COLOR,
  SEL_DIMENSI_LABEL, SURVEY_TEMA_TO_MODUL,
  getGeneralSkillsByModul, getDimensiByModul,
  SEL_INDIKATORS,
} from '../../../shared/data/sel-indicators';
import type { BSANModul, BSANGeneralSkill, SELDimensi } from '../../../shared/data/sel-indicators';
import {
  Brain, Users, Target, ChevronDown, Download, FileText, File,
  BookOpen, Sparkles, CheckCircle2, Eye, Loader2,
} from 'lucide-react';
import AnimatedCounter from '../../../shared/components/AnimatedCounter';

import html2pdf from 'html2pdf.js';

/* ─── Icon Map ─── */
const MODUL_ICONS: Record<BSANModul, typeof Brain> = {
  with_myself: Brain,
  with_others: Users,
  with_challenges: Target,
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

  // General + Specific Skills
  skills.forEach((gs, idx) => {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 }, children: [new TextRun({ text: `${idx + 1}. ${gs.name} (${gs.nameId})`, bold: true, size: 24 })] }));
    children.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: gs.descriptionId, italics: true, color: '555555', size: 20 })] }));

    gs.specificSkills.forEach(ss => {
      children.push(new Paragraph({ spacing: { after: 40 }, indent: { left: 400 }, bullet: { level: 0 }, children: [new TextRun({ text: `${ss.name} (${ss.nameId})`, bold: true, size: 20 })] }));
      children.push(new Paragraph({ spacing: { after: 80 }, indent: { left: 700 }, children: [new TextRun({ text: ss.descriptionId, color: '666666', size: 18 })] }));
    });
  });

  // Observasi SEL
  children.push(new Paragraph({ spacing: { before: 300, after: 60 }, children: [new TextRun({ text: '━'.repeat(60), color: 'CCCCCC', size: 16 })] }));
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { after: 120 }, children: [new TextRun({ text: 'Dimensi Observasi SEL', bold: true, size: 24 })] }));

  const headerRow = new TableRow({ children: ['Dimensi', 'Guru', 'Murid', 'Total'].map(h => new TableCell({ borders: borderNone, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, size: 18 })] })] })) });
  const dataRows = indicatorCounts.map(ic => new TableRow({ children: [ic.label, String(ic.guru), String(ic.murid), String(ic.total)].map((v, ci) => new TableCell({ borders: borderNone, children: [new Paragraph({ alignment: ci === 0 ? AlignmentType.LEFT : AlignmentType.CENTER, children: [new TextRun({ text: v, size: 18 })] })] })) }));

  children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...dataRows] }));

  // Survey tema
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

  // Footer
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
      {/* Skill Header */}
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

      {/* Skills Grid */}
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
/*  Main Page                                             */
/* ────────────────────────────────────────────────────── */

export default function ModulBsan() {
  const [activeTab, setActiveTab] = useState<BSANModul>('with_myself');
  const [kabupaten, setKabupaten] = useState('Kab. Sidoarjo');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [exportMenu, setExportMenu] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [breakdownTab, setBreakdownTab] = useState<number>(5);
  const printRef = useRef<HTMLDivElement>(null);

  const breakdownData: Record<number, { title: string; progres: string; questions: { id: number; q: string; options: { label: string; percent: number; color: string }[] }[] }> = {
    1: {
      title: 'Modul 1: Literasi & Numerasi Dasar',
      progres: '62%',
      questions: [
        {
          id: 1,
          q: 'Apakah sekolah telah memfasilitasi Pojok Baca / Sudut Literasi BSAN di setiap ruang kelas?',
          options: [
            { label: 'Ya, lengkap dengan bahan bacaan karakter BSAN', percent: 62.0, color: '#10B981' },
            { label: 'Ada pojok baca tetapi koleksi buku terbatas', percent: 28.5, color: '#F59E0B' },
            { label: 'Belum ada pojok baca di kelas', percent: 9.5, color: '#EF4444' },
          ]
        },
        {
          id: 2,
          q: 'Seberapa rutin guru menyelipkan aktivitas pembiasaan membaca 15 menit sebelum KBM?',
          options: [
            { label: 'Rutin setiap hari sebelum KBM dimulai', percent: 68.4, color: '#10B981' },
            { label: 'Hanya pada hari tertentu (2-3 kali seminggu)', percent: 24.1, color: '#3B82F6' },
            { label: 'Jarang / Tidak pernah', percent: 7.5, color: '#EF4444' },
          ]
        }
      ]
    },
    2: {
      title: 'Modul 2: Disiplin Positif & Antiperundungan',
      progres: '45%',
      questions: [
        {
          id: 1,
          q: 'Apakah guru telah menyusun Kesepakatan Kelas BSAN secara partisipatif bersama peserta didik?',
          options: [
            { label: 'Ya, disusun dan disepakati bersama di awal semester', percent: 45.0, color: '#10B981' },
            { label: 'Disiapkan oleh guru tanpa melibatkan murid', percent: 42.0, color: '#F59E0B' },
            { label: 'Belum ada kesepakatan kelas tertulis', percent: 13.0, color: '#EF4444' },
          ]
        },
        {
          id: 2,
          q: 'Bagaimana penanganan insiden perundungan ringan (verbal/relasional) di lingkungan sekolah?',
          options: [
            { label: 'Menggunakan pendekatan Restoratif / Disiplin Positif', percent: 52.3, color: '#10B981' },
            { label: 'Teguran lisan langsung tanpa refleksi emosi', percent: 36.7, color: '#F59E0B' },
            { label: 'Pemberian sanksi fisik / teguran keras', percent: 11.0, color: '#EF4444' },
          ]
        }
      ]
    },
    3: {
      title: 'Modul 3: Kesehatan Emosi & Pengelolaan Stres',
      progres: '36%',
      questions: [
        {
          id: 1,
          q: 'Apakah media Roda Emosi & Kartu Afirmasi rutin dimanfaatkan dalam sesi refleksi murid?',
          options: [
            { label: 'Rutin digunakan saat sesi pembukaan / refleksi', percent: 36.0, color: '#10B981' },
            { label: 'Digunakan sesekali jika ada murid yang bermasalah', percent: 48.0, color: '#F59E0B' },
            { label: 'Belum pernah digunakan di kelas', percent: 16.0, color: '#EF4444' },
          ]
        }
      ]
    },
    4: {
      title: 'Modul 4: Kebersihan & Kesehatan Lingkungan',
      progres: '42%',
      questions: [
        {
          id: 1,
          q: 'Apakah sekolah menyediakan fasilitas sanitasi ramah anak dan terpisah laki-laki/perempuan?',
          options: [
            { label: 'Ya, fasilitas bersih, layak, dan terpisah gender', percent: 42.0, color: '#10B981' },
            { label: 'Fasilitas terpisah tapi jumlah/kondisi kurang layak', percent: 44.5, color: '#F59E0B' },
            { label: 'Belum terpisah / Rusak berat', percent: 13.5, color: '#EF4444' },
          ]
        }
      ]
    },
    5: {
      title: 'Modul 5: Kemitraan Orang Tua & Komite',
      progres: '28%',
      questions: [
        {
          id: 1,
          q: 'Apakah sekolah rutin mengadakan sosialisasi & forum komunikasi BSAN dengan Wali Murid?',
          options: [
            { label: 'Ya, berkala setiap bagi rapor / bulanan', percent: 63.5, color: '#10B981' },
            { label: 'Hanya jika ada insiden / kebutuhan mendesak', percent: 28.4, color: '#F59E0B' },
            { label: 'Belum pernah diselenggarakan', percent: 8.1, color: '#EF4444' },
          ]
        },
        {
          id: 2,
          q: 'Apakah terdapat paguyuban / komite kelas yang aktif mendukung iklim aman sekolah?',
          options: [
            { label: 'Ya, paguyuban aktif berkolaborasi', percent: 59.2, color: '#10B981' },
            { label: 'Ada paguyuban tapi belum fokus BSAN', percent: 31.8, color: '#F59E0B' },
            { label: 'Belum terbentuk paguyuban', percent: 9.0, color: '#EF4444' },
          ]
        }
      ]
    }
  };

  const activeBreakdown = breakdownData[breakdownTab] || breakdownData[5];

  const { data: progressList = [] } = useQuery({
    queryKey: ['modulProgress', kabupaten],
    queryFn: () => database.getModulProgress({ kabupaten }),
  });

  const color = BSAN_MODUL_COLOR[activeTab];
  const Icon = MODUL_ICONS[activeTab];
  const skills = getGeneralSkillsByModul(activeTab);
  const dims = getDimensiByModul(activeTab);
  const prog = progressList.find(p => p.id === activeTab)?.progres || 0;

  const indicatorCounts = dims.map(d => ({
    dimensi: d,
    label: SEL_DIMENSI_LABEL[d],
    guru: SEL_INDIKATORS.filter(i => i.dimensi === d && i.subjek === 'guru').length,
    murid: SEL_INDIKATORS.filter(i => i.dimensi === d && i.subjek === 'murid').length,
    total: SEL_INDIKATORS.filter(i => i.dimensi === d).length,
  }));

  const kelasAwal = SURVEY_TEMA_TO_MODUL.kelasAwal[activeTab] || [];
  const kelasTinggi = SURVEY_TEMA_TO_MODUL.kelasTinggi[activeTab] || [];

  const handleExport = async (format: 'pdf' | 'docx') => {
    setExportMenu(false);
    setExporting(format);
    try {
      if (format === 'pdf' && printRef.current) {
        await exportPDF(printRef.current, `${BSAN_MODUL_LABEL[activeTab]}_${kabupaten}`);
      } else {
        await exportDOCX(activeTab, skills, indicatorCounts, kelasAwal, kelasTinggi, prog, kabupaten);
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ─── Compact Header ─── */}
      <div className="rounded-2xl bg-surface border border-border shadow-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}12` }}>
              <BookOpen className="h-5 w-5" style={{ color }} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary font-display">Framework Modul BSAN</h1>
              <p className="text-[11px] text-text-secondary">Social-Emotional Learning • CASEL Framework</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Kabupaten Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setDropdownOpen(!dropdownOpen); setExportMenu(false); }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-bg border border-border text-xs font-semibold text-text-primary hover:bg-border/40 transition-all cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full" style={{ background: KABUPATEN_LIST.find(k => k.id === kabupaten)?.color }} />
                {kabupaten}
                <ChevronDown className={`h-3.5 w-3.5 text-text-secondary transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-30 w-full min-w-[180px] rounded-xl bg-surface border border-border shadow-card-hover py-1 animate-scale-in">
                  {KABUPATEN_LIST.map(k => (
                    <button
                      key={k.id}
                      onClick={() => { setKabupaten(k.id); setDropdownOpen(false); }}
                      className={`flex items-center gap-2 w-full px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${kabupaten === k.id ? 'bg-primary/8 text-primary' : 'text-text-secondary hover:bg-bg'}`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ background: k.color }} />{k.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setExportMenu(!exportMenu); setDropdownOpen(false); }}
                disabled={!!exporting}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-all cursor-pointer shadow-sm disabled:opacity-60"
              >
                {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                <span>{exporting ? 'Exporting…' : 'Export'}</span>
              </button>
              {exportMenu && (
                <div className="absolute right-0 top-full mt-1.5 z-30 w-52 rounded-xl bg-surface border border-border shadow-card-hover py-1 animate-scale-in">
                  <button onClick={() => handleExport('pdf')} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-bg transition-all cursor-pointer">
                    <FileText className="h-4 w-4 text-red-500" />
                    <div className="text-left">
                      <div className="font-bold">Export PDF</div>
                      <div className="text-[9px] text-text-secondary">Dokumen visual lengkap</div>
                    </div>
                  </button>
                  <button onClick={() => handleExport('docx')} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-bg transition-all cursor-pointer">
                    <File className="h-4 w-4 text-blue-500" />
                    <div className="text-left">
                      <div className="font-bold">Export DOCX</div>
                      <div className="text-[9px] text-text-secondary">Dokumen Word editable</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Module Tabs — Inline within header */}
        <div className="flex gap-2 mt-4 overflow-x-auto custom-scrollbar pb-0.5">
          {BSAN_MODUL_ORDER.map(mid => {
            const MIcon = MODUL_ICONS[mid];
            const mProg = progressList.find(p => p.id === mid)?.progres || 0;
            const active = activeTab === mid;
            const mColor = BSAN_MODUL_COLOR[mid];
            return (
              <button
                key={mid}
                onClick={() => setActiveTab(mid)}
                className={`flex-shrink-0 flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer border ${active
                  ? 'text-white shadow-md'
                  : 'bg-bg/60 text-text-secondary border-border hover:bg-bg hover:text-text-primary'
                  }`}
                style={active ? { backgroundColor: mColor, borderColor: mColor, boxShadow: `0 4px 16px ${mColor}30` } : {}}
              >
                <MIcon className="h-4 w-4" />
                <div className="text-left">
                  <div className="text-[11px] font-bold leading-tight">{BSAN_MODUL_LABEL[mid]}</div>
                  <div className={`text-[9px] mt-0.5 ${active ? 'text-white/70' : 'text-text-secondary'}`}>{BSAN_MODUL_LABEL_ID[mid]}</div>
                </div>
                <span className={`ml-1 px-2 py-0.5 text-[10px] rounded-md font-bold ${active ? 'bg-white/20' : 'bg-surface border border-border/50'}`}>
                  {mProg}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Printable Content ─── */}
      <div ref={printRef} id="modul-bsan-content">
        {/* Module Title Bar */}
        <div
          className="rounded-2xl p-5 text-white relative overflow-hidden mb-5"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}
        >
          <div className="absolute -right-12 -top-12 w-56 h-56 bg-white/8 rounded-full blur-2xl" />
          <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/15 rounded-lg">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold font-display">{BSAN_MODUL_LABEL[activeTab]}</h2>
                <p className="text-white/60 text-[10px]">{BSAN_MODUL_LABEL_ID[activeTab]} • {BSAN_MODUL_SUBTITLE_ID[activeTab]}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {progressList.map(m => {
                const MI = MODUL_ICONS[m.id as BSANModul];
                return MI ? (
                  <div key={m.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${m.id === activeTab ? 'bg-white/20 font-bold' : 'bg-white/8 text-white/70'}`}>
                    <MI className="h-3.5 w-3.5" />
                    <AnimatedCounter value={m.progres} suffix="%" />
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>

        {/* ─── Top Grid (2 Columns: Left 8-col & Right 4-col) ─── */}
        <div key={`${activeTab}-${kabupaten}`} className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in items-start">
          {/* ── LEFT: Analisis & Breakdown Hasil Kuesioner (8 cols) ── */}
          <div className="lg:col-span-8 space-y-5">
            {/* Header breakdown */}
            <div className="rounded-2xl bg-surface border border-border shadow-card p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider mb-1">
                    Analisis Kuesioner Responden
                  </div>
                  <h3 className="text-base font-bold font-display text-text-primary">Breakdown Hasil Per Modul BSAN</h3>
                  <p className="text-xs text-text-secondary">Analisis detail jawaban terstruktur responden berdasarkan modul instrumen survei.</p>
                </div>

                <div className="flex items-center gap-2 bg-bg px-3 py-1.5 rounded-xl border border-border">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: KABUPATEN_LIST.find(k => k.id === kabupaten)?.color }} />
                  <span className="text-xs font-bold text-text-primary">{kabupaten}</span>
                </div>
              </div>

              {/* Navigasi Tab Modul 1 - 5 */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { id: 1, name: 'Modul 1', pct: '62%' },
                  { id: 2, name: 'Modul 2', pct: '45%' },
                  { id: 3, name: 'Modul 3', pct: '36%' },
                  { id: 4, name: 'Modul 4', pct: '42%' },
                  { id: 5, name: 'Modul 5', pct: '28%' },
                ].map(m => {
                  const active = breakdownTab === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setBreakdownTab(m.id)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${active
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 font-bold scale-[1.02]'
                        : 'bg-surface text-text-secondary border-border hover:border-primary/40 hover:text-text-primary'
                        }`}
                    >
                      <div className="text-xs font-bold">{m.name}</div>
                      <div className={`text-[10px] mt-0.5 font-medium ${active ? 'text-white/80' : 'text-text-secondary'}`}>{m.pct}</div>
                    </button>
                  );
                })}
              </div>

              {/* List Pertanyaan Breakdown */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary">{activeBreakdown.title}</h4>
                  <span className="text-xs font-bold text-text-secondary">Capaian: <strong className="text-primary">{activeBreakdown.progres}</strong></span>
                </div>

                {activeBreakdown.questions.map(item => (
                  <div key={item.id} className="rounded-xl bg-bg/50 border border-border/50 p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                        {item.id}
                      </span>
                      <h5 className="text-xs font-bold text-text-primary leading-relaxed">{item.q}</h5>
                    </div>

                    <div className="space-y-2.5 pl-9">
                      {item.options.map((opt, oi) => (
                        <div key={oi} className="space-y-1">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-semibold text-text-primary">{opt.label}</span>
                            <span className="font-bold text-text-primary">{opt.percent}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-border/40 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${opt.percent}%`, backgroundColor: opt.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Sidebar (4 cols: Progres Implementasi, Observasi SEL, Tema Survei) ── */}
          <div className="lg:col-span-4 space-y-4">
            {/* Progress Card */}
            <div className="rounded-2xl bg-surface border border-border shadow-card p-5">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Progres Implementasi</h3>
              <div className="flex items-end gap-3 mb-3">
                <span className="text-3xl font-black font-display" style={{ color }}>
                  <AnimatedCounter key={`p-${activeTab}-${kabupaten}`} value={prog} suffix="%" />
                </span>
                <span className="text-[10px] text-text-secondary mb-1">dari target 100%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-border/60 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${prog}%`, backgroundColor: color }} />
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-text-secondary">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* SEL Observasi */}
            <div className="rounded-2xl bg-surface border border-border shadow-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-4 w-4" style={{ color }} />
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Dimensi Observasi SEL</h3>
              </div>
              <div>
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
              <div className="mt-3 pt-3 border-t border-border/30 flex justify-between text-[10px]">
                <span className="text-text-secondary font-medium">Total Indikator</span>
                <span className="font-bold text-text-primary">{indicatorCounts.reduce((s, c) => s + c.total, 0)}</span>
              </div>
            </div>

            {/* Tema Survei */}
            <div className="rounded-2xl bg-surface border border-border shadow-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-4 w-4" style={{ color }} />
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Tema Kuesioner Survei</h3>
              </div>

              {/* Kelas Awal */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-sudah" />
                  <span className="text-[10px] font-bold text-text-primary">Kelas Awal (1–3)</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-status-sudah/10 text-status-sudah font-bold ml-auto">{kelasAwal.length}</span>
                </div>
                <div className="space-y-1">
                  {kelasAwal.map((t, i) => (
                    <div key={i} className="flex items-start gap-2 text-[10px] text-text-secondary pl-3.5">
                      <CheckCircle2 className="h-3 w-3 text-status-sudah shrink-0 mt-px" />
                      <span className="leading-relaxed">{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kelas Tinggi */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold text-text-primary">Kelas Tinggi (4–6)</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-bold ml-auto">{kelasTinggi.length}</span>
                </div>
                <div className="space-y-1">
                  {kelasTinggi.map((t, i) => (
                    <div key={i} className="flex items-start gap-2 text-[10px] text-text-secondary pl-3.5">
                      <CheckCircle2 className="h-3 w-3 text-primary shrink-0 mt-px" />
                      <span className="leading-relaxed">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── BOTTOM SECTION: Rincian Kompetensi SEL (General & Specific Skills Mapped) ─── */}
        <div className="mt-10 pt-8 border-t border-border/60 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-accent/10 text-accent text-[11px] font-bold uppercase tracking-wider mb-1">
                Kerangka Kerja CASEL SEL
              </div>
              <h3 className="text-lg font-bold font-display text-text-primary">Detail Skills & Kompetensi SEL Modul</h3>
              <p className="text-xs text-text-secondary">Rincian General Skills dan Specific Skills yang dikembangkan pada {BSAN_MODUL_LABEL[activeTab]}.</p>
            </div>
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
