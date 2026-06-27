import { useState, useRef, useEffect } from 'react';
import AppModal from '../common/AppModal';
import { DownloadOutlined } from '@ant-design/icons';

const WhatsAppIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const RANKS  = ['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const EXAMS  = ['Half Yearly Exam','Annual Exam','Unit Test 1','Unit Test 2','Unit Test 3','Final Exam','Monthly Test'];

/* ── Inline certificate HTML (also used for print) ── */
function CertificateView({ student, form, percentage, autoGrade, logoSrc }) {
  const gold = '#C9A84C';
  const dark = '#1a1a1a';
  const cream = '#fdf8ee';

  return (
    <div style={{
      width: '100%', maxWidth: 740, margin: '0 auto',
      background: cream,
      border: `14px solid ${dark}`,
      outline: `5px solid ${gold}`,
      outlineOffset: '-20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Georgia, "Times New Roman", serif',
      boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
    }}>

      {/* ── Watermark ── */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 0, pointerEvents: 'none', zIndex: 0,
        overflow: 'hidden',
      }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{
            fontSize: 48, fontWeight: 900, color: gold,
            opacity: 0.045, whiteSpace: 'nowrap', letterSpacing: 10,
            fontFamily: 'Arial, sans-serif', lineHeight: 1.8,
            transform: 'rotate(-15deg)',
            userSelect: 'none',
          }}>
            SHREE RAM ACADEMY &nbsp;&nbsp; SHREE RAM ACADEMY &nbsp;&nbsp; SHREE RAM ACADEMY
          </div>
        ))}
      </div>

      {/* ── Corner ornaments ── */}
      {[
        { top: 8,    left: 8,    br: '0 0 100% 0' },
        { top: 8,    right: 8,   br: '0 0 0 100%' },
        { bottom: 8, left: 8,    br: '0 100% 0 0' },
        { bottom: 8, right: 8,   br: '100% 0 0 0' },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', width: 42, height: 42,
          border: `3px solid ${gold}`,
          borderRadius: s.br, zIndex: 1,
          ...s,
        }} />
      ))}

      {/* ── Content ── */}
      <div style={{ position: 'relative', zIndex: 2, padding: '24px 52px 30px' }}>

        {/* Header — academy name only, like navbar */}
        <div style={{
          background: dark,
          margin: '-24px -52px 0',
          borderBottom: `3px solid ${gold}`,
          display: 'flex', alignItems: 'center', padding: '12px 28px',
          position: 'relative',
        }}>
          {/* Logo — left */}
          <img src={logoSrc} alt="Shree Ram Academy"
            style={{ width: 86, height: 86, borderRadius: '50%', border: `2px solid ${gold}`, objectFit: 'contain', background: '#fff', flexShrink: 0 }} />

          {/* Academy name — absolute center */}
          <div style={{ position: 'absolute', left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: gold, letterSpacing: 4, fontFamily: '"Palatino Linotype", "Palatino", "Book Antiqua", Georgia, serif', lineHeight: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                SHREE RAM ACADEMY
              </div>
              <div style={{ width: '100%', height: 1, background: `linear-gradient(to right, transparent, ${gold}, transparent)`, margin: '6px 0 5px' }} />
              <div style={{ fontSize: 12, color: '#fff', letterSpacing: 3, fontFamily: 'Georgia, serif', textTransform: 'uppercase' }}>
                Since 2016
              </div>
            </div>
          </div>

          {/* Best Award Badge — exact match */}
          <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
            <svg width="80" height="106" viewBox="0 0 80 106" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="tailG" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f5e070"/>
                  <stop offset="50%" stopColor="#C9A84C"/>
                  <stop offset="100%" stopColor="#7a5c0a"/>
                </linearGradient>
                <linearGradient id="ringG" x1="10%" y1="0%" x2="90%" y2="100%">
                  <stop offset="0%" stopColor="#fff0a0"/>
                  <stop offset="25%" stopColor="#C9A84C"/>
                  <stop offset="60%" stopColor="#f0d060"/>
                  <stop offset="100%" stopColor="#7a5c0a"/>
                </linearGradient>
                <radialGradient id="navyG" cx="40%" cy="33%" r="68%">
                  <stop offset="0%" stopColor="#2535b0"/>
                  <stop offset="60%" stopColor="#0f1560"/>
                  <stop offset="100%" stopColor="#060920"/>
                </radialGradient>
                <filter id="bsh" x="-15%" y="-15%" width="130%" height="130%">
                  <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.5"/>
                </filter>
              </defs>

              {/* Ribbon tails — direct screen coords, V-shape, no overlap */}
              {/* Left ribbon: touches center at top, spreads left at bottom */}
              <polygon points="40,67 25,67 16,104 25,97 32,104" fill="url(#tailG)"/>
              <line x1="32.5" y1="67" x2="24" y2="100" stroke="#a07820" strokeWidth="0.7" opacity="0.5"/>
              {/* Right ribbon: mirror */}
              <polygon points="40,67 55,67 64,104 55,97 48,104" fill="url(#tailG)"/>
              <line x1="47.5" y1="67" x2="56" y2="100" stroke="#a07820" strokeWidth="0.7" opacity="0.5"/>

              {/* Starburst outer ring — 20 points */}
              {(() => {
                const cx=40, cy=37, oR=35, iR=29, pts=20;
                let d='';
                for(let i=0;i<pts*2;i++){
                  const r=i%2===0?oR:iR;
                  const a=(i*Math.PI/pts)-Math.PI/2;
                  d+=(i===0?'M':'L')+`${(cx+r*Math.cos(a)).toFixed(2)},${(cy+r*Math.sin(a)).toFixed(2)}`;
                }
                return <path d={d+'Z'} fill="url(#ringG)" filter="url(#bsh)"/>;
              })()}

              {/* Gold border circle between star and navy */}
              <circle cx="40" cy="37" r="28" fill="none" stroke="#f0d060" strokeWidth="1.2"/>

              {/* Navy inner circle */}
              <circle cx="40" cy="37" r="27" fill="url(#navyG)"/>

              {/* Inner gold ring */}
              <circle cx="40" cy="37" r="24.5" fill="none" stroke="#C9A84C" strokeWidth="1"/>

              {/* "Best" — italic script style */}
              <text x="40" y="32" textAnchor="middle" fill="#f0d060"
                fontSize="12" fontStyle="italic" fontWeight="700"
                fontFamily="Georgia,'Times New Roman',serif">Best</text>

              {/* "AWARD" */}
              <text x="40" y="42" textAnchor="middle" fill="#ffffff"
                fontSize="8.5" fontWeight="900" letterSpacing="1.5"
                fontFamily="Arial Black,Arial,sans-serif">AWARD</text>

              {/* Stars */}
              <text x="40" y="51" textAnchor="middle" fill="#C9A84C"
                fontSize="7" fontFamily="Arial,sans-serif" letterSpacing="1">★ ★ ★</text>
            </svg>
          </div>
        </div>

        {/* Certificate title — below header */}
        <div style={{ textAlign: 'center', padding: '20px 52px 0', position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: 30, fontWeight: 900, color: dark, letterSpacing: 6, fontFamily: 'Arial Black, Arial, sans-serif', textTransform: 'uppercase', lineHeight: 1 }}>
            Certificate
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '8px 0 4px' }}>
            <div style={{ flex: 1, height: 1.5, background: `linear-gradient(to right, transparent, ${gold})` }} />
            <span style={{ fontSize: 11, letterSpacing: 5, color: gold, fontFamily: 'Arial,sans-serif', fontWeight: 700, textTransform: 'uppercase' }}>
              Of Achievement
            </span>
            <div style={{ flex: 1, height: 1.5, background: `linear-gradient(to left, transparent, ${gold})` }} />
          </div>
          <div style={{ marginBottom: 16 }} />
        </div>


        {/* Presented to */}
        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <p style={{ fontSize: 10, color: '#888', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'Arial,sans-serif', marginBottom: 6 }}>
            This Certificate is Proudly Presented to
          </p>
          <p style={{ fontSize: 36, color: dark, fontStyle: 'italic', margin: '0 0 2px', lineHeight: 1.2 }}>
            {student.name}
          </p>
          <div style={{ width: 220, height: 2, background: `linear-gradient(90deg,transparent,${gold},transparent)`, margin: '8px auto 14px' }} />
        </div>

        {/* Body text */}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#444', lineHeight: 1.9, maxWidth: 520, margin: '0 auto 18px', fontFamily: 'Georgia,serif' }}>
          Having achieved{' '}
          <strong style={{ color: dark }}>
            {form.marksObtained || '__'}/{form.totalMarks || '__'} Marks
            {percentage !== null ? ` (${percentage}%)` : ''}
            {autoGrade ? ` — Grade ${autoGrade}` : ''}
          </strong>{' '}
          and secured <strong style={{ color: gold, fontSize: 14 }}>{form.rank} Rank</strong> in{' '}
          <strong style={{ color: dark }}>{form.examName}</strong>
          {form.subject ? <> in <strong style={{ color: dark }}>{form.subject}</strong></> : ''},{' '}
          Class <strong style={{ color: dark }}>{student.std}</strong>.
        </p>


        {/* Divider */}
        <div style={{ borderTop: `1.5px dashed ${gold}`, opacity: 0.4, margin: '0 40px 18px' }} />

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 10px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#555', letterSpacing: 1, fontFamily: 'Arial', marginBottom: 6 }}>
              {form.month} {form.year}
            </div>
            <div style={{ width: 130, borderBottom: `2px solid ${dark}`, marginBottom: 4 }} />
            <div style={{ fontSize: 9, color: '#888', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: 1 }}>Date</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img src={logoSrc} alt="seal"
              style={{ width: 56, height: 56, borderRadius: '50%', opacity: 0.4, marginBottom: 4, objectFit: 'contain', background: cream, imageRendering: 'high-quality' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <img src="/signature.png" alt="Signature"
              style={{ height: 48, maxWidth: 140, objectFit: 'contain', marginBottom: 2, display: 'block', margin: '0 auto 2px' }} />
            <div style={{ width: 140, borderBottom: `2px solid ${dark}`, margin: '0 auto 4px' }} />
            <div style={{ fontSize: 9, color: '#888', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: 1 }}>
              Owner / Director
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function CertificateModal({ open, onClose, student }) {
  const certRef    = useRef(null);
  const wrapperRef = useRef(null);
  const now        = new Date();
  const logoSrc    = '/logo.jpg';
  const CERT_W  = 740;
  const CERT_H  = 500;
  const [scale, setScale] = useState(1);

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

  const [form, setForm] = useState({
    examName:      'Half Yearly Exam',
    subject:       '',
    marksObtained: '',
    totalMarks:    '100',
    rank:          '1st',
    month:         MONTHS[now.getMonth()],
    year:          String(now.getFullYear()),
    grade:         '',
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const percentage = form.marksObtained && form.totalMarks
    ? Math.round((Number(form.marksObtained) / Number(form.totalMarks)) * 100)
    : null;

  const autoGrade = percentage === null ? '' :
    percentage >= 91 ? 'O'  :
    percentage >= 81 ? 'A+' :
    percentage >= 71 ? 'A'  :
    percentage >= 61 ? 'B+' :
    percentage >= 51 ? 'B'  :
    percentage >= 41 ? 'C'  :
    percentage >= 33 ? 'D'  : 'F';

  const handleDownload = async () => {
    const el = certRef.current;
    if (!el) return;
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: null });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`Certificate_${student?.name?.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error(err);
    }
  };

  const [waStatus, setWaStatus] = useState('');

  const handleWhatsAppShare = async () => {
    const el = certRef.current;
    if (!el) return;
    setWaStatus('generating');
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fdf8ee' });
      const fileName = `Certificate_${student?.name?.replace(/\s+/g, '_')}.png`;

      canvas.toBlob(async (blob) => {
        const file = new File([blob], fileName, { type: 'image/png' });

        // Mobile: Web Share API — directly opens WhatsApp share sheet
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          setWaStatus('');
          await navigator.share({ files: [file], title: `Certificate - ${student.name}` });
          return;
        }

        // Desktop fallback: copy image to clipboard, open WhatsApp Web
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

  if (!student) return null;

  return (
    <AppModal open={open} onClose={onClose} title="Generate Certificate"
      subtitle={`${student.name} — Class ${student.std}`} width={Math.min(860, window.innerWidth - 16)} destroyOnClose>
      <div className="px-5 py-4 flex flex-col gap-5">

        {/* Form */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Exam Name',      type: 'select', key: 'examName',      options: EXAMS },
            { label: 'Subject',        type: 'text',   key: 'subject',       placeholder: 'e.g. Mathematics' },
            { label: 'Marks Obtained', type: 'number', key: 'marksObtained', placeholder: 'e.g. 85' },
            { label: 'Total Marks',    type: 'number', key: 'totalMarks' },
            { label: 'Grade (Auto)',   type: 'auto',   key: 'grade' },
            { label: 'Rank',           type: 'select', key: 'rank',          options: RANKS },
            { label: 'Month',          type: 'select', key: 'month',         options: MONTHS },
            { label: 'Year',           type: 'text',   key: 'year' },
          ].map(({ label, type, key, options, placeholder }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>
              {type === 'select' ? (
                <select value={form[key]} onChange={(e) => set(key, e.target.value)}
                  className="px-2 py-1.5 rounded-lg text-xs outline-none"
                  style={{ border: '1.5px solid #C9A84C', background: '#fffdf5' }}>
                  {options.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : type === 'auto' ? (
                <input readOnly value={autoGrade || '—'}
                  className="px-2 py-1.5 rounded-lg text-xs font-bold outline-none"
                  style={{ border: '1.5px solid #C9A84C', background: '#f5f0e8', color: '#856404', cursor: 'default' }} />
              ) : (
                <input type={type} value={form[key]} placeholder={placeholder}
                  onChange={(e) => set(key, e.target.value)}
                  className="px-2 py-1.5 rounded-lg text-xs outline-none"
                  style={{ border: '1.5px solid #C9A84C', background: '#fffdf5' }} />
              )}
            </div>
          ))}
        </div>

        {/* Preview — scrollable frame */}
        <div ref={wrapperRef} style={{ width: '100%', overflowX: 'auto', overflowY: 'auto', maxHeight: 520, WebkitOverflowScrolling: 'touch', borderRadius: 8, border: '1px solid #e5e7eb' }}>
          <div ref={certRef} style={{ minWidth: CERT_W }}>
            <CertificateView student={student} form={form} percentage={percentage} autoGrade={autoGrade} logoSrc={logoSrc} />
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
          style={{ background: 'linear-gradient(135deg,#1a1a1a,#2a2a2a)', color: '#C9A84C', border: '1.5px solid #C9A84C' }}>
          <DownloadOutlined /> Download PDF
        </button>
      </div>
    </AppModal>
  );
}
