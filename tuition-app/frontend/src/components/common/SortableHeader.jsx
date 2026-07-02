/** Clickable <th> that shows an asc/desc indicator for the active sort field. */
export default function SortableHeader({ label, field, sortField, sortDir, onSort, className = 'p-3' }) {
  const active = sortField === field;
  return (
    <th
      onClick={() => onSort(field)}
      className={`${className} text-left text-xs font-semibold cursor-pointer select-none`}
      style={{ color: '#C9A84C' }}
      title="Sort by date"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span style={{ fontSize: 9, opacity: active ? 1 : 0.4 }}>
          {active ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
        </span>
      </span>
    </th>
  );
}
