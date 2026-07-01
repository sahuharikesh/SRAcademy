import { MONTHS } from './constants';

/** Today as YYYY-MM-DD (for date inputs) */
export const todayISO = () => new Date().toISOString().split('T')[0];

/** Extract YYYY-MM-DD from an ISO datetime string (for date inputs) */
export const toInputDate = (dateStr) => dateStr?.split('T')[0] ?? '';

/** Format a date with toLocaleDateString en-IN */
export const formatDate = (date, opts = {}) =>
  date ? new Date(date).toLocaleDateString('en-IN', opts) : '—';

/** 02 Jul 2026 */
export const formatShort = (date) =>
  formatDate(date, { day: '2-digit', month: 'short', year: 'numeric' });

/** 02 July 2026 */
export const formatLong = (date) =>
  formatDate(date, { day: '2-digit', month: 'long', year: 'numeric' });

/** 02-07-2026  (for CSV exports — avoids Excel ### issue) */
export const formatDDMMYYYY = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
};

/** "Monday, 1 July 2026" */
export const formatFull = (date) =>
  formatDate(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

/** Current month name from MONTHS array */
export const currentMonthName = () => MONTHS[new Date().getMonth()];

/** "June 2025 – April 2026" academic year string */
export const getAcademicYear = (dateStr) => {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  const startYear = d.getMonth() >= 5 ? d.getFullYear() : d.getFullYear() - 1;
  return `June ${startYear} – April ${startYear + 1}`;
};
