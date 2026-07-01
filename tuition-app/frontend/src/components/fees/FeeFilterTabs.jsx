import { GOLD } from '../../utils/constants';

const TABS = ['All', 'Upcoming', 'No Due', 'Partial', 'Overdue', 'Paid'];

const tabColors = {
  All:      null,
  Upcoming: { inactive: { background: '#fff7ed', color: '#c2410c', borderColor: '#fdba74' } },
  'No Due': { inactive: { background: '#f9fafb', color: '#374151', borderColor: '#d1d5db' } },
  Partial:  { inactive: { background: '#fef3c7', color: '#b45309', borderColor: '#fcd34d' } },
  Overdue:  { inactive: { background: '#fee2e2', color: '#dc2626', borderColor: '#fca5a5' } },
  Paid:     { inactive: { background: '#dcfce7', color: '#15803d', borderColor: '#86efac' } },
};

export default function FeeFilterTabs({ fees, active, onChange }) {
  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      {TABS.map((tab) => {
        const isActive = active === tab;
        const count = fees.filter((f) => tab === 'All' || f.status === tab).length;
        const colorStyle = tabColors[tab]?.inactive || { background: '#fff', color: '#555', borderColor: '#C9A84C' };

        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className="btn-shine px-3 py-0.5 rounded-full text-xs font-bold transition-all"
            style={isActive
              ? { ...GOLD, border: '1.5px solid transparent', boxShadow: '0 4px 14px rgba(201,168,76,0.4)' }
              : { ...colorStyle, border: `1.5px solid ${colorStyle.borderColor}` }}>
            {tab}
            <span
              className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black"
              style={isActive
                ? { background: 'rgba(0,0,0,0.2)', color: 'inherit' }
                : { background: 'rgba(0,0,0,0.08)', color: 'inherit' }}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
