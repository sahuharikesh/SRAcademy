const styles = {
  Paid:     { background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' },
  Overdue:  { background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' },
  'No Due': { background: '#e5e7eb', color: '#374151', border: '1px solid #d1d5db' },
  Partial:  { background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d' },
  Upcoming: { background: '#fff7ed', color: '#c2410c', border: '1px solid #fdba74' },
  Pending:  { background: '#e5e7eb', color: '#374151', border: '1px solid #d1d5db' },
  Present:  { background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' },
  Absent:   { background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' },
  Late:     { background: '#fef9c3', color: '#854d0e', border: '1px solid #fef08a' },
};

import { formatShort } from '../../utils/dates';

export default function StatusBadge({ status, paidDate }) {
  const s = styles[status] || { background: '#e5e7eb', color: '#374151', border: '1px solid #d1d5db' };
  return (
    <div className="inline-flex flex-col items-center gap-0.5">
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide${status === 'Overdue' ? ' badge-overdue' : ''}`}
        style={s}>
        {status}
      </span>
      {status === 'Paid' && paidDate && (
        <span className="text-[10px] text-gray-400">{formatShort(paidDate)}</span>
      )}
    </div>
  );
}
