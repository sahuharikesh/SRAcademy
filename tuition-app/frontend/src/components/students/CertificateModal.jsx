import { useState, useRef } from 'react';
import AppModal from '../common/AppModal';
import { PrinterOutlined } from '@ant-design/icons';

const RANKS  = ['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const EXAMS  = ['Half Yearly Exam','Annual Exam','Unit Test 1','Unit Test 2','Unit Test 3','Final Exam','Monthly Test'];

/* ── Inline certificate HTML (also used for print) ── */
function CertificateView({ student, form, percentage, logoSrc }) {
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
      <div style={{ position: 'relative', zIndex: 2, padding: '36px 52px 30px' }}>

        {/* Header — academy name only, like navbar */}
        <div style={{
          background: dark,
          margin: '-36px -52px 0',
          borderBottom: `3px solid ${gold}`,
          display: 'flex', alignItems: 'center', padding: '12px 28px',
          position: 'relative',
        }}>
          {/* Logo — left */}
          <img src={logoSrc} alt="Shree Ram Academy"
            style={{ width: 72, height: 72, borderRadius: '50%', border: `2px solid ${gold}`, objectFit: 'contain', background: '#fff', flexShrink: 0 }} />

          {/* Academy name — absolute center */}
          <div style={{ position: 'absolute', left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: gold, letterSpacing: 4, fontFamily: '"Palatino Linotype", "Palatino", "Book Antiqua", Georgia, serif', lineHeight: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                SHREE RAM ACADEMY
              </div>
              <div style={{ width: '100%', height: 1, background: `linear-gradient(to right, transparent, ${gold}, transparent)`, margin: '5px 0 4px' }} />
              <div style={{ fontSize: 10, color: '#fff', letterSpacing: 3, fontFamily: 'Georgia, serif', textTransform: 'uppercase' }}>
                Since 2016
              </div>
            </div>
          </div>

          {/* Best Award Badge — right end of header */}
          <div style={{ marginLeft: 'auto', flexShrink: 0, position: 'relative', width: 72, height: 72 }}>
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} style={{
                position: 'absolute', width: 72, height: 72, top: 0, left: 0,
                background: `linear-gradient(135deg, #f0d060, ${gold})`,
                clipPath: 'polygon(50% 0%,53% 47%,100% 50%,53% 53%,50% 100%,47% 53%,0% 50%,47% 47%)',
                transform: `rotate(${i * (360 / 16)}deg)`,
              }} />
            ))}
            <div style={{ position: 'absolute', inset: 5, borderRadius: '50%', background: `linear-gradient(135deg,${gold},#f0d060,${gold})` }} />
            <div style={{
              position: 'absolute', inset: 10, borderRadius: '50%',
              background: `linear-gradient(135deg,#0f1235,#1a2060)`,
              border: `1.5px solid ${gold}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2,
            }}>
              <div style={{ fontSize: 6, color: gold, letterSpacing: 1, textAlign: 'center' }}>★ ★ ★</div>
              <div style={{ fontSize: 9, fontWeight: 900, color: gold, fontFamily: 'Arial Black,Arial,sans-serif', lineHeight: 1.1 }}>BEST</div>
              <div style={{ fontSize: 7, color: '#fff', fontFamily: 'Arial,sans-serif', letterSpacing: 1 }}>AWARD</div>
            </div>
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
            {form.grade ? ` — Grade ${form.grade}` : ''}
          </strong>{' '}
          and secured <strong style={{ color: gold, fontSize: 14 }}>{form.rank} Rank</strong> in{' '}
          <strong style={{ color: dark }}>{form.examName}</strong>,{' '}
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
            <div style={{ fontSize: 13, color: gold, fontStyle: 'italic', fontFamily: 'Georgia', marginBottom: 6 }}>
              Shree Ram Academy
            </div>
            <div style={{ width: 140, borderBottom: `2px solid ${dark}`, margin: '0 auto 4px' }} />
            <div style={{ fontSize: 9, color: '#888', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: 1 }}>
              Principal / Director
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function CertificateModal({ open, onClose, student }) {
  const certRef = useRef(null);
  const now     = new Date();
  const logoSrc = '/logo.jpg';

  const [form, setForm] = useState({
    examName:      'Half Yearly Exam',
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

  const handlePrint = () => {
    const html = certRef.current?.innerHTML;
    if (!html) return;
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Certificate — ${student?.name}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f0e8;padding:16px;}
        @media print{body{background:white;padding:0;} @page{size:A4 landscape;margin:8mm;}}
      </style></head><body>${html}</body></html>`);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 500);
  };

  if (!student) return null;

  return (
    <AppModal open={open} onClose={onClose} title="Generate Certificate"
      subtitle={`${student.name} — Class ${student.std}`} width={860} destroyOnClose>
      <div className="px-5 py-4 flex flex-col gap-5">

        {/* Form */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Exam Name',      type: 'text',   key: 'examName',      placeholder: 'e.g. Half Yearly Exam' },
            { label: 'Marks Obtained', type: 'number', key: 'marksObtained', placeholder: 'e.g. 85' },
            { label: 'Total Marks',    type: 'number', key: 'totalMarks' },
            { label: 'Grade',          type: 'text',   key: 'grade',         placeholder: 'e.g. A+' },
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
              ) : (
                <input type={type} value={form[key]} placeholder={placeholder}
                  onChange={(e) => set(key, e.target.value)}
                  className="px-2 py-1.5 rounded-lg text-xs outline-none"
                  style={{ border: '1.5px solid #C9A84C', background: '#fffdf5' }} />
              )}
            </div>
          ))}
        </div>

        {/* Preview */}
        <div ref={certRef}>
          <CertificateView student={student} form={form} percentage={percentage} logoSrc={logoSrc} />
        </div>

      </div>

      <div className="px-5 pb-5 flex gap-3">
        <button onClick={onClose} className="flex-1 py-2 rounded-lg text-xs font-black"
          style={{ background: '#f3f4f6', color: '#374151' }}>Cancel</button>
        <button onClick={handlePrint}
          className="flex-1 py-2 rounded-lg text-xs font-black flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg,#1a1a1a,#2a2a2a)', color: '#C9A84C', border: '1.5px solid #C9A84C' }}>
          <PrinterOutlined /> Print / Download PDF
        </button>
      </div>
    </AppModal>
  );
}
