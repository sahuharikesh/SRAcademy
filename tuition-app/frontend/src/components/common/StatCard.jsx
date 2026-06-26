import { useEffect, useRef, useState } from 'react';

const themes = {
  gold: {
    bg:     'linear-gradient(135deg, #b8860b 0%, #d4a017 50%, #c9a84c 100%)',
    accent: '#fff8dc',
    border: '#ffe066',
    icon:   { bg: 'rgba(255,248,220,0.25)', color: '#fff8dc' },
    glow:   'rgba(201,168,76,0.4)',
  },
  blue: {
    bg:     'linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #2196f3 100%)',
    accent: '#e3f2fd',
    border: '#64b5f6',
    icon:   { bg: 'rgba(227,242,253,0.25)', color: '#e3f2fd' },
    glow:   'rgba(33,150,243,0.4)',
  },
  green: {
    bg:     'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)',
    accent: '#e8f5e9',
    border: '#66bb6a',
    icon:   { bg: 'rgba(232,245,233,0.25)', color: '#e8f5e9' },
    glow:   'rgba(56,142,60,0.4)',
  },
  red: {
    bg:     'linear-gradient(135deg, #b71c1c 0%, #c62828 50%, #d32f2f 100%)',
    accent: '#ffebee',
    border: '#ef9a9a',
    icon:   { bg: 'rgba(255,235,238,0.25)', color: '#ffebee' },
    glow:   'rgba(211,47,47,0.4)',
  },
  purple: {
    bg:     'linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #7b1fa2 100%)',
    accent: '#f3e5f5',
    border: '#ce93d8',
    icon:   { bg: 'rgba(243,229,245,0.25)', color: '#f3e5f5' },
    glow:   'rgba(123,31,162,0.4)',
  },
  teal: {
    bg:     'linear-gradient(135deg, #004d40 0%, #00695c 50%, #00796b 100%)',
    accent: '#e0f2f1',
    border: '#4db6ac',
    icon:   { bg: 'rgba(224,242,241,0.25)', color: '#e0f2f1' },
    glow:   'rgba(0,121,107,0.4)',
  },
  default: {
    bg:     'linear-gradient(135deg, #37474f 0%, #455a64 50%, #546e7a 100%)',
    accent: '#eceff1',
    border: '#b0bec5',
    icon:   { bg: 'rgba(236,239,241,0.20)', color: '#eceff1' },
    glow:   'rgba(84,110,122,0.3)',
  },
};

function useCountUp(target, duration = 900) {
  const isNum = typeof target === 'number' && !Number.isNaN(target);
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    if (!isNum) return;
    const from = prevRef.current;
    prevRef.current = target;
    if (from === target) return;

    let start = null;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, isNum, duration]);

  return isNum ? display : target;
}

export default function StatCard({ label, value, icon, variant = 'default' }) {
  const t = themes[variant] || themes.default;
  const animated = useCountUp(typeof value === 'number' ? value : NaN);
  const displayValue = typeof value === 'number' ? animated : value;

  return (
    <div
      className="card-lift rounded-xl px-4 py-3.5 flex items-center justify-between gap-3 relative overflow-hidden"
      style={{
        background:   t.bg,
        borderLeft:   `3px solid ${t.border}`,
        borderTop:    '1px solid rgba(255,255,255,0.07)',
        borderRight:  '1px solid rgba(255,255,255,0.07)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        boxShadow:    `0 3px 18px rgba(0,0,0,0.38), 0 1px 4px ${t.glow}`,
      }}
    >
      {/* Text */}
      <div className="min-w-0 flex-1">
        <div
          className="text-2xl font-black leading-tight tabular-nums"
          style={{ color: t.accent }}
        >
          {displayValue}
        </div>
        <div
          className="text-[10px] font-semibold uppercase tracking-wider mt-0.5"
          style={{ color: 'rgba(255,255,255,0.48)' }}
        >
          {label}
        </div>
      </div>

      {/* Icon bubble */}
      {icon && (
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{
            background: t.icon.bg,
            color:      t.icon.color,
            boxShadow:  `0 2px 8px rgba(0,0,0,0.2)`,
            transition: 'transform 0.22s ease',
          }}
        >
          {icon}
        </div>
      )}

      {/* Diagonal shine overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 55%)' }}
      />
    </div>
  );
}
