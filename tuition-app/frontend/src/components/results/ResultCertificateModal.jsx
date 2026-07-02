import { useState, useRef, useEffect } from 'react';
import AppModal from '../common/AppModal';
import { DownloadOutlined } from '@ant-design/icons';
import { MONTHS } from '../../utils/constants';

const WhatsAppIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

function calcPct(obtained, max) {
  if (obtained == null || max == null || max === 0) return null;
  return Math.round((obtained / max) * 100);
}

function gradeLabel(pct) {
  if (pct == null) return 'AB';
  if (pct >= 90) return 'A+';
  if (pct >= 75) return 'A';
  if (pct >= 60) return 'B';
  if (pct >= 45) return 'C';
  if (pct >= 33) return 'D';
  return 'F';
}

/* ── Template 1: Classic (cream + gold) ── */
function ClassicView({ student, examName, total, maxTotal, pct, grade, month, year, logoSrc }) {
  const gold  = 'var(--brand-gold, #C9A84C)';
  const dark  = 'var(--brand-dark, #1a1a1a)';
  const cream = '#fdf8ee';

  return (
    <div style={{
      width: '100%', maxWidth: 740, height: 450, margin: '0 auto',
      background: cream,
      border: `14px solid ${dark}`,
      outline: `5px solid ${gold}`,
      outlineOffset: '-20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Georgia, "Times New Roman", serif',
      boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
    }}>

      {/* Watermark */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ fontSize: 48, fontWeight: 900, color: gold, opacity: 0.045, whiteSpace: 'nowrap', letterSpacing: 10, fontFamily: 'Arial, sans-serif', lineHeight: 1.8, transform: 'rotate(-15deg)', userSelect: 'none' }}>
            SHREE RAM ACADEMY &nbsp;&nbsp; SHREE RAM ACADEMY &nbsp;&nbsp; SHREE RAM ACADEMY
          </div>
        ))}
      </div>

      {/* Corner ornaments */}
      {[{ top: 8, left: 8, br: '0 0 100% 0' }, { top: 8, right: 8, br: '0 0 0 100%' }, { bottom: 8, left: 8, br: '0 100% 0 0' }, { bottom: 8, right: 8, br: '100% 0 0 0' }].map((s, i) => (
        <div key={i} style={{ position: 'absolute', width: 42, height: 42, border: `3px solid ${gold}`, borderRadius: s.br, zIndex: 1, ...s }} />
      ))}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, padding: '16px 52px 20px' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#0a0a0a 0%,var(--brand-dark, #1a1a1a) 50%,#0a0a0a 100%)', margin: '-24px -52px 0', borderBottom: `2px solid ${gold}`, display: 'flex', alignItems: 'center', padding: '10px 28px', gap: 16, position: 'relative' }}>
          <img src={logoSrc} alt="logo" style={{ width: 68, height: 68, borderRadius: '50%', border: `2px solid ${gold}`, objectFit: 'cover', flexShrink: 0 }} />
          <div style={{ position: 'absolute', left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: gold, letterSpacing: '0.18em', fontFamily: 'Georgia, serif', lineHeight: 1 }}>SHREE RAM ACADEMY</div>
              <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${gold}88,transparent)`, margin: '6px auto', width: '80%' }} />
              <div style={{ fontSize: 10, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.65)', fontFamily: 'sans-serif', fontWeight: 600 }}>SINCE 2016  ·  EXCELLENCE IN EDUCATION</div>
            </div>
          </div>
          {/* Merit badge */}
          <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
            <svg width="72" height="96" viewBox="0 0 80 106" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="rc1TailG" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#f5e070"/><stop offset="50%" stopColor="var(--brand-gold, #C9A84C)"/><stop offset="100%" stopColor="#7a5c0a"/></linearGradient>
                <linearGradient id="rc1RingG" x1="10%" y1="0%" x2="90%" y2="100%"><stop offset="0%" stopColor="#fff0a0"/><stop offset="25%" stopColor="var(--brand-gold, #C9A84C)"/><stop offset="60%" stopColor="#f0d060"/><stop offset="100%" stopColor="#7a5c0a"/></linearGradient>
                <radialGradient id="rc1NavyG" cx="40%" cy="33%" r="68%"><stop offset="0%" stopColor="#2535b0"/><stop offset="60%" stopColor="#0f1560"/><stop offset="100%" stopColor="#060920"/></radialGradient>
                <filter id="rc1Bsh" x="-15%" y="-15%" width="130%" height="130%"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.5"/></filter>
              </defs>
              <polygon points="40,67 25,67 16,104 25,97 32,104" fill="url(#rc1TailG)"/>
              <polygon points="40,67 55,67 64,104 55,97 48,104" fill="url(#rc1TailG)"/>
              {(() => { const cx=40,cy=37,oR=35,iR=29,pts=20; let d=''; for(let i=0;i<pts*2;i++){const r=i%2===0?oR:iR;const a=(i*Math.PI/pts)-Math.PI/2;d+=(i===0?'M':'L')+`${(cx+r*Math.cos(a)).toFixed(2)},${(cy+r*Math.sin(a)).toFixed(2)}`;} return <path d={d+'Z'} fill="url(#rc1RingG)" filter="url(#rc1Bsh)"/>; })()}
              <circle cx="40" cy="37" r="27" fill="url(#rc1NavyG)"/>
              <circle cx="40" cy="37" r="24.5" fill="none" stroke="var(--brand-gold, #C9A84C)" strokeWidth="1"/>
              <text x="40" y="33" textAnchor="middle" fill="#f0d060" fontSize="10" fontStyle="italic" fontWeight="700" fontFamily="Georgia,serif">Merit</text>
              <text x="40" y="43" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="900" letterSpacing="1" fontFamily="Arial,sans-serif">AWARD</text>
              <text x="40" y="52" textAnchor="middle" fill="var(--brand-gold, #C9A84C)" fontSize="7" fontFamily="Arial,sans-serif">★ ★ ★</text>
            </svg>
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: dark, letterSpacing: 5, fontFamily: 'Arial Black, Arial, sans-serif', textTransform: 'uppercase', lineHeight: 1 }}>Certificate of Merit</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '5px 0 3px' }}>
            <div style={{ flex: 1, height: 1.5, background: `linear-gradient(to right, transparent, ${gold})` }} />
            <span style={{ fontSize: 10, letterSpacing: 4, color: gold, fontFamily: 'Arial,sans-serif', fontWeight: 700, textTransform: 'uppercase' }}>Academic Excellence</span>
            <div style={{ flex: 1, height: 1.5, background: `linear-gradient(to left, transparent, ${gold})` }} />
          </div>
        </div>

        {/* Presented to */}
        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <p style={{ fontSize: 9, color: '#888', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'Arial,sans-serif', marginBottom: 3 }}>This Certificate is Proudly Presented to</p>
          <p style={{ fontSize: 26, color: dark, fontStyle: 'italic', margin: '0 0 2px', lineHeight: 1.1 }}>{student.name}</p>
          <div style={{ width: 180, height: 2, background: `linear-gradient(90deg,transparent,${gold},transparent)`, margin: '4px auto 6px' }} />
        </div>

        {/* Body */}
        <p style={{ textAlign: 'center', fontSize: 11, color: '#444', lineHeight: 1.7, maxWidth: 500, margin: '0 auto 8px', fontFamily: 'Georgia,serif' }}>
          This is to certify that <strong style={{ color: dark }}>{student.name}</strong> has successfully attained{' '}
          <strong style={{ color: dark }}>{total}/{maxTotal} Marks {pct != null ? `(${pct}%)` : ''} — Grade {grade}</strong>{' '}
          in <strong style={{ color: dark }}>{examName}</strong>, Class <strong style={{ color: dark }}>{student.std}</strong>, in recognition of outstanding academic performance.
        </p>

        <div style={{ borderTop: `1.5px dashed ${gold}`, opacity: 0.4, margin: '0 40px 8px' }} />

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 10px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#555', letterSpacing: 1, fontFamily: 'Arial', marginBottom: 6 }}>{month} {year}</div>
            <div style={{ width: 120, borderBottom: `2px solid ${dark}`, marginBottom: 4 }} />
            <div style={{ fontSize: 9, color: '#888', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: 1 }}>Date</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img src={logoSrc} alt="seal" style={{ width: 52, height: 52, borderRadius: '50%', opacity: 0.4, objectFit: 'contain' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <img src="/signature.png" alt="Signature" style={{ height: 44, maxWidth: 130, objectFit: 'contain', display: 'block', margin: '0 auto 2px' }} />
            <div style={{ width: 130, borderBottom: `2px solid ${dark}`, margin: '0 auto 4px' }} />
            <div style={{ fontSize: 9, color: '#888', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: 1 }}>Owner / Director</div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Template 2: Modern (navy + white) ── */
function ModernView({ student, examName, total, maxTotal, pct, grade, month, year, logoSrc }) {
  const navy = '#1e3a5f';
  const gold = 'var(--brand-gold, #C9A84C)';

  return (
    <div style={{ width: '100%', maxWidth: 740, height: 450, margin: '0 auto', background: '#ffffff', border: `4px solid ${navy}`, outline: `2px solid ${gold}`, outlineOffset: '-14px', position: 'relative', overflow: 'hidden', fontFamily: 'Helvetica, Arial, sans-serif', boxShadow: '0 12px 48px rgba(0,0,0,0.18)' }}>

      {/* Watermark */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ fontSize: 48, fontWeight: 900, color: navy, opacity: 0.03, whiteSpace: 'nowrap', letterSpacing: 10, fontFamily: 'Arial, sans-serif', lineHeight: 1.8, transform: 'rotate(-15deg)', userSelect: 'none' }}>
            SHREE RAM ACADEMY &nbsp;&nbsp; SHREE RAM ACADEMY &nbsp;&nbsp; SHREE RAM ACADEMY
          </div>
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${navy}, #2d5a8e)`, padding: '14px 32px', display: 'flex', alignItems: 'center', position: 'relative' }}>
          <img src={logoSrc} alt="logo" style={{ width: 58, height: 58, borderRadius: '50%', border: `2px solid ${gold}`, objectFit: 'cover', flexShrink: 0 }} />
          <div style={{ position: 'absolute', left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#ffffff', letterSpacing: '0.15em', lineHeight: 1 }}>SHREE RAM ACADEMY</div>
              <div style={{ fontSize: 9, letterSpacing: '0.08em', color: gold, fontWeight: 600, marginTop: 5 }}>SINCE 2016 · EXCELLENCE IN EDUCATION</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ background: '#ffffff', padding: '14px 52px' }}>
          <div style={{ textAlign: 'center', marginBottom: 4 }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: navy, letterSpacing: 5, fontFamily: 'Arial Black, Arial, sans-serif', textTransform: 'uppercase', lineHeight: 1 }}>CERTIFICATE</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '8px 0 10px' }}>
            <div style={{ flex: 1, height: 1, background: gold }} />
            <span style={{ fontSize: 9, letterSpacing: 4, color: gold, fontFamily: 'Arial,sans-serif', fontWeight: 700, textTransform: 'uppercase' }}>OF MERIT</span>
            <div style={{ flex: 1, height: 1, background: gold }} />
          </div>

          <div style={{ textAlign: 'center', marginBottom: 6 }}>
            <p style={{ fontSize: 9, color: '#888', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'Arial,sans-serif', marginBottom: 8 }}>THIS CERTIFICATE IS AWARDED TO</p>
            <p style={{ fontSize: 34, fontWeight: 700, color: navy, margin: '0 0 2px', lineHeight: 1.1, fontFamily: 'Helvetica, Arial, sans-serif' }}>{student.name}</p>
            <div style={{ width: 200, height: 2, background: gold, margin: '8px auto 10px' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: 11.5, color: navy, lineHeight: 1.8, maxWidth: 500, margin: '0 auto 14px', fontFamily: 'Helvetica, Arial, sans-serif' }}>
            This is to certify that <strong>{student.name}</strong> has attained{' '}
            <strong>{total}/{maxTotal} Marks {pct != null ? `(${pct}%)` : ''}</strong>{' '}
            with <strong style={{ color: gold, fontSize: 13 }}>Grade {grade}</strong> in{' '}
            <strong>{examName}</strong>, Class <strong>{student.std}</strong>, in recognition of outstanding academic achievement.
          </p>

          <div style={{ borderTop: `1.5px solid ${gold}`, opacity: 0.5, margin: '0 40px 14px' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 10px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: navy, letterSpacing: 1, fontFamily: 'Arial', marginBottom: 6 }}>{month} {year}</div>
              <div style={{ width: 120, borderBottom: `2px solid ${navy}`, marginBottom: 4 }} />
              <div style={{ fontSize: 9, color: '#888', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: 1 }}>Date</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <img src={logoSrc} alt="seal" style={{ width: 52, height: 52, borderRadius: '50%', opacity: 0.4, objectFit: 'contain' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <img src="/signature.png" alt="Signature" style={{ height: 44, maxWidth: 130, objectFit: 'contain', display: 'block', margin: '0 auto 2px' }} />
              <div style={{ width: 130, borderBottom: `2px solid ${navy}`, margin: '0 auto 4px' }} />
              <div style={{ fontSize: 9, color: '#888', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: 1 }}>Owner / Director</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Template 3: Royal (dark + gold) ── */
function RoyalView({ student, examName, total, maxTotal, pct, grade, month, year, logoSrc }) {
  const gold = 'var(--brand-gold, #C9A84C)';
  const bg   = '#0d0d0d';

  return (
    <div style={{ width: '100%', maxWidth: 740, height: 450, margin: '0 auto', background: bg, border: `12px solid ${bg}`, outline: `4px solid ${gold}`, outlineOffset: '-20px', position: 'relative', overflow: 'hidden', fontFamily: 'Georgia, "Times New Roman", serif', boxShadow: '0 12px 48px rgba(0,0,0,0.6)' }}>

      {/* Corner diamonds */}
      {[{ top: 20, left: 20 }, { top: 20, right: 20 }, { bottom: 20, left: 20 }, { bottom: 20, right: 20 }].map((s, i) => (
        <div key={i} style={{ position: 'absolute', fontSize: 20, color: gold, zIndex: 3, lineHeight: 1, ...s }}>◆</div>
      ))}

      <div style={{ position: 'relative', zIndex: 2, padding: '16px 52px 18px' }}>
        {/* Top: logo + name */}
        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <img src={logoSrc} alt="logo" style={{ width: 50, height: 50, borderRadius: '50%', border: `3px solid ${gold}`, objectFit: 'cover', display: 'block', margin: '0 auto 5px' }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: gold, letterSpacing: '0.2em', fontFamily: 'Georgia, serif', lineHeight: 1 }}>SHREE RAM ACADEMY</div>
          <div style={{ width: 200, height: 1, background: gold, margin: '5px auto' }} />
          <div style={{ fontSize: 8, letterSpacing: '0.12em', color: 'rgba(201,168,76,0.6)', fontFamily: 'Arial, sans-serif', fontWeight: 600 }}>SINCE 2016 · EXCELLENCE IN EDUCATION</div>
        </div>

        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, margin: '0 20px 6px' }} />

        <div style={{ textAlign: 'center', marginBottom: 3 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: gold, letterSpacing: 5, fontFamily: 'Arial Black, Arial, sans-serif', textTransform: 'uppercase' }}>CERTIFICATE OF MERIT</div>
        </div>

        <div style={{ textAlign: 'center', color: gold, fontSize: 10, letterSpacing: 4, margin: '3px 0 5px', opacity: 0.6 }}>· — · — · — · — · — · — · — ·</div>

        <div style={{ textAlign: 'center', marginBottom: 5 }}>
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'Arial,sans-serif', marginBottom: 3 }}>Presented with Honour to</p>
          <p style={{ fontSize: 30, color: '#ffffff', fontStyle: 'italic', margin: '0 0 2px', lineHeight: 1.1, fontFamily: 'Georgia, serif' }}>{student.name}</p>
          <div style={{ width: 200, height: 2, background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, margin: '5px auto 6px' }} />
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, maxWidth: 500, margin: '0 auto 8px', fontFamily: 'Georgia,serif' }}>
          This is to certify that <strong style={{ color: '#ffffff' }}>{student.name}</strong> has attained{' '}
          <strong style={{ color: '#ffffff' }}>{total}/{maxTotal} Marks {pct != null ? `(${pct}%)` : ''}</strong>{' '}
          with <strong style={{ color: gold, fontSize: 14 }}>Grade {grade}</strong> in{' '}
          <strong style={{ color: '#ffffff' }}>{examName}</strong>, Class <strong style={{ color: '#ffffff' }}>{student.std}</strong>, in recognition of outstanding academic performance.
        </p>

        <div style={{ borderTop: `1px solid ${gold}`, opacity: 0.3, margin: '0 40px 8px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 10px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#ffffff', letterSpacing: 1, fontFamily: 'Arial', marginBottom: 6 }}>{month} {year}</div>
            <div style={{ width: 120, borderBottom: `2px solid ${gold}`, marginBottom: 4 }} />
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: 1 }}>Date</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img src={logoSrc} alt="seal" style={{ width: 52, height: 52, borderRadius: '50%', opacity: 0.3, objectFit: 'contain' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <img src="/signature.png" alt="Signature" style={{ height: 44, maxWidth: 130, objectFit: 'contain', display: 'block', margin: '0 auto 2px' }} />
            <div style={{ width: 130, borderBottom: `2px solid ${gold}`, margin: '0 auto 4px' }} />
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: 1 }}>Owner / Director</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Modal ── */
export default function ResultCertificateModal({ open, onClose, student, examName, examRecords }) {
  const certRef    = useRef(null);
  const wrapperRef = useRef(null);
  const now        = new Date();
  const logoSrc    = '/logo.jpg';
  const CERT_W     = 740;
  const [scale, setScale]     = useState(1);
  const [template, setTemplate] = useState('Template 1');
  const [month, setMonth]     = useState(MONTHS[now.getMonth()]);
  const [year, setYear]       = useState(String(now.getFullYear()));
  const [waStatus, setWaStatus] = useState('');

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setScale(Math.min(1, w / CERT_W));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [open]);

  if (!student || !examRecords) return null;

  const total    = examRecords.reduce((s, r) => s + (r.obtainedMarks ?? 0), 0);
  const maxTotal = examRecords.reduce((s, r) => s + r.maxMarks, 0);
  const pct      = calcPct(total, maxTotal);
  const grade    = gradeLabel(pct);

  const CertView = template === 'Template 2' ? ModernView
    : template === 'Template 3' ? RoyalView
    : ClassicView;

  const handleDownload = async () => {
    const el = certRef.current;
    if (!el) return;
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: null });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`ResultCertificate_${student?.name?.replace(/\s+/g, '_')}_${examName}.pdf`);
    } catch (err) { console.error(err); }
  };

  const handleWhatsAppShare = async () => {
    const el = certRef.current;
    if (!el) return;
    setWaStatus('generating');
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fdf8ee' });
      const fileName = `ResultCertificate_${student?.name?.replace(/\s+/g, '_')}.png`;
      canvas.toBlob(async (blob) => {
        const file = new File([blob], fileName, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          setWaStatus('');
          await navigator.share({ files: [file], title: `Result Certificate - ${student.name}` });
          return;
        }
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setWaStatus('copied');
          window.open('https://web.whatsapp.com', '_blank');
          setTimeout(() => setWaStatus(''), 5000);
        } catch {
          setWaStatus('unsupported');
          setTimeout(() => setWaStatus(''), 4000);
        }
      }, 'image/png');
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err);
      setWaStatus('');
    }
  };

  return (
    <AppModal open={open} onClose={onClose} title="Result Certificate"
      subtitle={`${student.name} — ${examName}`} width={Math.min(860, window.innerWidth - 16)} destroyOnClose>
      <div className="px-5 py-4 flex flex-col gap-4">

        {/* Controls */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Template</label>
            <select value={template} onChange={e => setTemplate(e.target.value)}
              className="px-2 py-1.5 rounded-lg text-xs outline-none"
              style={{ border: '1.5px solid var(--brand-gold, #C9A84C)', background: '#fffdf5' }}>
              {['Template 1', 'Template 2', 'Template 3'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Month</label>
            <select value={month} onChange={e => setMonth(e.target.value)}
              className="px-2 py-1.5 rounded-lg text-xs outline-none"
              style={{ border: '1.5px solid var(--brand-gold, #C9A84C)', background: '#fffdf5' }}>
              {MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Year</label>
            <input type="text" value={year} onChange={e => setYear(e.target.value)}
              className="px-2 py-1.5 rounded-lg text-xs outline-none"
              style={{ border: '1.5px solid var(--brand-gold, #C9A84C)', background: '#fffdf5' }} />
          </div>
        </div>

        {/* Marks summary */}
        <div className="flex gap-3 justify-center">
          {[
            { label: 'Marks', value: `${total}/${maxTotal}` },
            { label: 'Percentage', value: pct != null ? `${pct}%` : '—' },
            { label: 'Grade', value: grade },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center px-4 py-2 rounded-xl"
              style={{ background: '#fffdf5', border: '1.5px solid var(--brand-gold, #C9A84C)' }}>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{label}</span>
              <span className="text-sm font-black" style={{ color: 'var(--brand-dark, #1a1a1a)' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Certificate preview */}
        <div ref={wrapperRef} style={{ width: '100%', overflowX: 'auto', overflowY: 'auto', maxHeight: 520, WebkitOverflowScrolling: 'touch', borderRadius: 8, border: '1px solid #e5e7eb' }}>
          <div ref={certRef} style={{ minWidth: CERT_W }}>
            <CertView
              student={student}
              examName={examName}
              total={total}
              maxTotal={maxTotal}
              pct={pct}
              grade={grade}
              month={month}
              year={year}
              logoSrc={logoSrc}
            />
          </div>
        </div>

      </div>

      {waStatus === 'copied' && (
        <div className="mx-5 mb-2 px-3 py-2 rounded-lg text-xs text-center font-semibold"
          style={{ background: '#e8f5e9', color: '#1b5e20', border: '1px solid #a5d6a7' }}>
          Image clipboard mein copy ho gayi! WhatsApp Web mein <strong>Ctrl+V</strong> se paste karein.
        </div>
      )}
      {waStatus === 'unsupported' && (
        <div className="mx-5 mb-2 px-3 py-2 rounded-lg text-xs text-center font-semibold"
          style={{ background: '#fff3e0', color: '#e65100', border: '1px solid #ffcc80' }}>
          Is browser mein direct share supported nahi hai. PDF download karein.
        </div>
      )}

      <div className="px-5 pb-5 flex gap-3">
        <button onClick={handleWhatsAppShare} disabled={waStatus === 'generating'}
          className="flex-1 py-2 rounded-lg text-xs font-black flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', color: '#fff', opacity: waStatus === 'generating' ? 0.7 : 1 }}>
          <WhatsAppIcon /> {waStatus === 'generating' ? 'Please wait...' : 'WhatsApp'}
        </button>
        <button onClick={handleDownload}
          className="flex-1 py-2 rounded-lg text-xs font-black flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg,var(--brand-dark, #1a1a1a),#2a2a2a)', color: 'var(--brand-gold, #C9A84C)', border: '1.5px solid var(--brand-gold, #C9A84C)' }}>
          <DownloadOutlined /> Download PDF
        </button>
      </div>
    </AppModal>
  );
}
