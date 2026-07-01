const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

/**
 * Build CSV string and trigger browser download.
 * @param {string[]} headers - Column headers
 * @param {any[][]} rows     - Array of row arrays (values will be escaped)
 * @param {string}  filename - Download filename (include .csv)
 */
export function downloadCSV(headers, rows, filename) {
  const csv = [
    headers.join(','),
    ...rows.map((r) => r.map(escape).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
