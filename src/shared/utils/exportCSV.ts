/**
 * @file exportCSV.ts
 * @description Shared CSV/Excel export utility — format konsisten sesuai contoh ekspor BSAN.
 *   Selalu menyertakan NPSN apabila ada data sekolah.
 */

/** Escape CSV cell agar aman (double-quote, newlines) */
export function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).trim();
  if (str === 'null' || str === 'undefined' || str === 'NaN' || str.toLowerCase() === 'jawaban esai') return '""';
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/** Build one CSV row from an array of values */
export function buildCsvRow(values: unknown[], sep = ','): string {
  return values.map(escapeCsvCell).join(sep);
}

/**
 * Generate the standard BSAN export file header (5 rows meta-info).
 * Matches the format found in sample exports.
 */
export function buildBsanCsvHeader(opts: {
  title: string;
  wilayah: string;
  waktu?: string;
  totalInfo?: string;
  sep?: string;
}): string {
  const sep = opts.sep ?? ',';
  const waktu = opts.waktu ?? new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  const lines: string[] = [
    escapeCsvCell(opts.title),
    escapeCsvCell('Dinas Pendidikan Provinsi Jawa Timur'),
    escapeCsvCell(`Wilayah: ${opts.wilayah}`),
    escapeCsvCell(`Waktu Cetak: ${waktu}`),
    opts.totalInfo ? escapeCsvCell(opts.totalInfo) : '',
    '', // blank separator row
  ];
  return lines.map(l => l ? `${l}${sep}` : '').join('\n') + '\n';
}

/**
 * Trigger browser download.
 * @param content  File text content
 * @param filename File name (with extension)
 * @param mime     MIME type
 */
export function triggerDownload(content: string, filename: string, mime = 'text/csv;charset=utf-8;'): void {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Sanitize filename: replace spaces & special chars */
export function safeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-\.]/g, '_').replace(/_+/g, '_');
}

/** Format date as YYYYMMDD_HHmm */
export function dateStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}
