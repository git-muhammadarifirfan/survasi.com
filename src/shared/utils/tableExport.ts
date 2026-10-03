/**
 * @file tableExport.ts
 * @description Ekspor tabel generik ke XLSX (multi-sheet) dan CSV dengan format rapi
 *   yang seragam di seluruh halaman: baris judul/meta, header tebal, lebar kolom
 *   otomatis, autofilter, dan freeze header. Data selalu berasal dari API (real).
 */
import * as XLSX from 'xlsx';
import { escapeCsvCell, triggerDownload, safeFilename, dateStamp } from './exportCSV';

export type ExportFormat = 'xlsx' | 'csv';

export interface ExportSheet {
  /** Nama sheet (maks 31 karakter, dipotong otomatis) */
  name: string;
  columns: string[];
  rows: Array<Array<string | number | null | undefined>>;
}

export interface ExportPayload {
  /** Judul laporan, mis. "Rekap Proporsi Modul BSAN" */
  title: string;
  /** Keterangan wilayah/filter aktif */
  wilayah?: string;
  /** Prefix nama file tanpa ekstensi */
  filename: string;
  sheets: ExportSheet[];
}

const META_ROWS = 4; // judul, instansi, wilayah, waktu cetak

function metaLines(p: ExportPayload): string[] {
  return [
    p.title,
    'Dinas Pendidikan Provinsi Jawa Timur — Monitoring BSAN',
    `Wilayah / Filter: ${p.wilayah || 'Semua Wilayah'}`,
    `Waktu Cetak: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`,
  ];
}

function normalizeCell(v: unknown): string | number {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return Number.isFinite(v) ? v : '';
  const s = String(v).trim();
  if (s === 'null' || s === 'undefined' || s === 'NaN') return '';
  return s;
}

function buildSheet(p: ExportPayload, sheet: ExportSheet): XLSX.WorkSheet {
  const aoa: (string | number)[][] = [
    ...metaLines(p).map(l => [l]),
    [],
    sheet.columns,
    ...sheet.rows.map(r => r.map(normalizeCell)),
  ];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  const headerRow = META_ROWS + 1; // 0-based index baris header
  // Lebar kolom otomatis (dibatasi agar teks panjang tidak membuat kolom raksasa)
  ws['!cols'] = sheet.columns.map((c, ci) => {
    const longest = Math.max(
      String(c).length,
      ...sheet.rows.slice(0, 500).map(r => String(normalizeCell(r[ci])).length),
    );
    return { wch: Math.min(Math.max(longest + 2, 8), 60) };
  });
  if (sheet.rows.length > 0 && sheet.columns.length > 0) {
    ws['!autofilter'] = {
      ref: XLSX.utils.encode_range({ s: { r: headerRow, c: 0 }, e: { r: headerRow + sheet.rows.length, c: sheet.columns.length - 1 } }),
    };
  }
  ws['!merges'] = [0, 1, 2, 3].map(r => ({ s: { r, c: 0 }, e: { r, c: Math.max(sheet.columns.length - 1, 0) } }));
  // Freeze baris header
  (ws as any)['!views'] = [{ state: 'frozen', ySplit: headerRow + 1 }];
  return ws;
}

/** Unduh payload sebagai XLSX (multi-sheet) atau CSV (seluruh sheet berurutan). Mengembalikan nama file. */
export function exportTable(p: ExportPayload, format: ExportFormat): string {
  const base = `${safeFilename(p.filename)}_${dateStamp()}`;

  if (format === 'xlsx') {
    const wb = XLSX.utils.book_new();
    const used = new Set<string>();
    p.sheets.forEach(sheet => {
      let name = sheet.name.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31) || 'Data';
      let i = 2;
      while (used.has(name)) name = `${name.slice(0, 28)} ${i++}`;
      used.add(name);
      XLSX.utils.book_append_sheet(wb, buildSheet(p, sheet), name);
    });
    XLSX.writeFile(wb, `${base}.xlsx`, { compression: true });
    return `${base}.xlsx`;
  }

  const lines: string[] = metaLines(p).map(l => escapeCsvCell(l));
  p.sheets.forEach(sheet => {
    lines.push('');
    if (p.sheets.length > 1) lines.push(escapeCsvCell(`## ${sheet.name}`));
    lines.push(sheet.columns.map(escapeCsvCell).join(','));
    sheet.rows.forEach(r => lines.push(r.map(v => escapeCsvCell(normalizeCell(v))).join(',')));
  });
  triggerDownload(lines.join('\n'), `${base}.csv`);
  return `${base}.csv`;
}

/** Format tanggal-waktu lokal (WIB) yang konsisten untuk sel ekspor. */
export function fmtDateTime(v: unknown): string {
  if (!v) return '';
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return String(v);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const STATUS_PENGISIAN_LABEL: Record<string, string> = {
  sudah: 'Selesai',
  sebagian: 'Proses Mengisi',
  belum: 'Belum Mengisi',
};
