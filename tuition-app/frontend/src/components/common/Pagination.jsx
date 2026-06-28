export default function Pagination({ page, pageSize, total, onChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;

  // Build page number list with ellipsis
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
  }

  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  const btnBase = 'min-w-[28px] h-7 px-1.5 rounded text-xs font-semibold flex items-center justify-center transition';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mt-3 px-1">
      <div className="text-xs text-gray-400">
        Showing <span className="font-semibold text-gray-600">{from}–{to}</span> of{' '}
        <span className="font-semibold text-gray-600">{total}</span> records
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className={btnBase}
          style={{ background: page === 1 ? '#f3f4f6' : '#fff', color: page === 1 ? '#ccc' : '#374151',
            border: '1px solid #e5e7eb', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
          ‹
        </button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="text-xs text-gray-400 px-1">…</span>
          ) : (
            <button key={p} onClick={() => onChange(p)}
              className={btnBase}
              style={p === page
                ? { background: '#1a1a1a', color: '#C9A84C', border: '1px solid #C9A84C' }
                : { background: '#fff', color: '#374151', border: '1px solid #e5e7eb' }}>
              {p}
            </button>
          )
        )}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
          className={btnBase}
          style={{ background: page === totalPages ? '#f3f4f6' : '#fff',
            color: page === totalPages ? '#ccc' : '#374151', border: '1px solid #e5e7eb',
            cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>
          ›
        </button>
        {onPageSizeChange && (
          <select value={pageSize} onChange={(e) => { onPageSizeChange(Number(e.target.value)); onChange(1); }}
            className="ml-2 text-xs rounded px-1.5 py-1 outline-none"
            style={{ border: '1px solid #C9A84C', background: '#fff', color: '#374151' }}>
            {[15, 25, 50].map((s) => <option key={s} value={s}>{s} / page</option>)}
          </select>
        )}
      </div>
    </div>
  );
}
