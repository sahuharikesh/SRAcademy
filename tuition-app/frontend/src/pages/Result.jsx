import { useState, useRef, useEffect } from 'react';
import {
  TrophyOutlined, PlusOutlined, DeleteOutlined,
  PrinterOutlined, EditOutlined, CheckOutlined, CloseOutlined, DownloadOutlined, EyeOutlined,
} from '@ant-design/icons';
import toast from 'react-hot-toast';
import { getStudents, saveStudentMarks, getStudentResults, deleteStudentExam } from '../api';
import { SUBJECTS, EXAMS, STD_OPTIONS, getSubjectsForStd } from '../utils/constants';

const gold = '#C9A84C';
const dark = '#1a1a1a';

// ── Std Subject Config (localStorage) ───────────────────────────────────────
function loadStdConfig(std) {
  try { return JSON.parse(localStorage.getItem(`sra_cfg_${std}`)) || null; } catch { return null; }
}
function saveStdConfig(std, cfg) {
  localStorage.setItem(`sra_cfg_${std}`, JSON.stringify(cfg));
}


function StdSubjectConfig({ std, onSaved }) {
  const subjectsForStd = getSubjectsForStd(std);

  const init = () => {
    const saved = loadStdConfig(std);
    const base  = subjectsForStd.map(s => ({ subject: s, maxMarks: '100', enabled: false }));
    if (!saved) return base;
    // Merge saved values but only keep subjects valid for this std
    return base.map(b => {
      const match = saved.find(r => r.subject === b.subject);
      return match ? { ...b, maxMarks: match.maxMarks, enabled: match.enabled } : b;
    });
  };
  const [rows, setRows] = useState(init);

  useEffect(() => { setRows(init()); }, [std]);

  const toggle  = (s) => setRows(p => p.map(r => r.subject === s ? { ...r, enabled: !r.enabled } : r));
  const setMax  = (s, v) => setRows(p => p.map(r => r.subject === s ? { ...r, maxMarks: v } : r));
  const enabled = rows.filter(r => r.enabled).length;

  const handleSave = () => {
    if (enabled === 0) return toast.error('Please select at least one subject');
    saveStdConfig(std, rows);
    toast.success(`${enabled} subjects saved for ${std}`);
    if (onSaved) onSaved(rows.filter(r => r.enabled));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        {rows.map(r => (
          <div key={r.subject} className="flex items-center gap-2 rounded-xl px-2 py-1.5"
            style={{ background: r.enabled ? '#fffdf5' : '#f9fafb', border: `1.5px solid ${r.enabled ? gold : '#e5e7eb'}` }}>
            <button onClick={() => toggle(r.subject)} className="flex items-center gap-2 flex-1 text-left min-w-0">
              <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                style={{ background: r.enabled ? dark : '#fff', border: `1.5px solid ${r.enabled ? gold : '#d1d5db'}` }}>
                {r.enabled && <CheckOutlined style={{ fontSize: 8, color: gold }} />}
              </div>
              <span className="text-[11px] font-semibold truncate" style={{ color: r.enabled ? dark : '#9ca3af' }}>{r.subject}</span>
            </button>
            {r.enabled && (
              <input type="number" value={r.maxMarks} min={1}
                onChange={e => setMax(r.subject, e.target.value)}
                className="px-1 py-0.5 rounded text-[10px] text-center outline-none flex-shrink-0"
                style={{ border: `1.5px solid ${gold}`, background: '#fff', width: 44 }}
                placeholder="Max" />
            )}
          </div>
        ))}
      </div>
      <button onClick={handleSave}
        className="py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2"
        style={{ background: dark, color: gold, border: `1.5px solid ${gold}` }}>
        <CheckOutlined /> Save &amp; Continue ({enabled} subjects)
      </button>
    </div>
  );
}

// Load logo as base64 once so html2canvas renders it sharply
let _logoB64 = null;
function useLogoB64() {
  const [logo, setLogo] = useState(_logoB64 || '/logo.jpg');
  useEffect(() => {
    if (_logoB64) { setLogo(_logoB64); return; }
    fetch('/logo.jpg')
      .then(r => r.blob())
      .then(blob => new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(blob); }))
      .then(b64 => { _logoB64 = b64; setLogo(b64); })
      .catch(() => {});
  }, []);
  return logo;
}

function gradeInfo(pct) {
  if (pct == null) return { label: 'AB', color: '#9ca3af', bg: '#f3f4f6' };
  if (pct >= 90)   return { label: 'A+', color: '#15803d', bg: '#dcfce7' };
  if (pct >= 75)   return { label: 'A',  color: '#16a34a', bg: '#f0fdf4' };
  if (pct >= 60)   return { label: 'B',  color: '#2563eb', bg: '#eff6ff' };
  if (pct >= 45)   return { label: 'C',  color: '#d97706', bg: '#fffbeb' };
  if (pct >= 33)   return { label: 'D',  color: '#ea580c', bg: '#fff7ed' };
  return { label: 'F', color: '#dc2626', bg: '#fef2f2' };
}

function calcPct(obtained, max) {
  if (obtained == null || max == null || max === 0) return null;
  return Math.round((obtained / max) * 100);
}

const newSubjectRow = () => ({ id: Date.now() + Math.random(), subject: SUBJECTS[0], maxMarks: '100', obtainedMarks: '', absent: false });

// ── Print Card ──────────────────────────────────────────────────────────────
// Template 1 — Classic (dark header, cream body)
function PrintCardT1({ student, examRecords, cardRef }) {
  const logoSrc  = useLogoB64();
  const total    = examRecords.reduce((s, r) => s + (r.obtainedMarks ?? 0), 0);
  const maxTotal = examRecords.reduce((s, r) => s + r.maxMarks, 0);
  const pct      = calcPct(total, maxTotal);
  const g        = gradeInfo(pct);
  return (
    <div ref={cardRef} style={{ border: `2px solid ${gold}`, borderRadius: 10, overflow: 'hidden', background: '#fdf8ee' }}>
      <div style={{ background: 'linear-gradient(135deg,#0a0a0a 0%,#1a1a1a 50%,#0a0a0a 100%)', borderBottom: `3px solid ${gold}`, padding: '10px 20px', display: 'flex', alignItems: 'center' }}>
        <img src="/logo.jpg" alt="logo" style={{ width: 58, height: 58, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${gold}`, flexShrink: 0 }} />
        <div style={{ flex: 1, textAlign: 'center', lineHeight: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.15em', color: gold, fontFamily: 'Georgia, serif' }}>SHREE RAM ACADEMY</div>
          <hr style={{ border: 'none', borderTop: `1px solid rgba(201,168,76,0.5)`, margin: '4px auto', width: '80%' }} />
          <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.2em' }}>SINCE 2016 · EXCELLENCE IN EDUCATION</div>
        </div>
      </div>
      <div style={{ padding: '8px 20px 16px', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 0 }}>
          <img src={logoSrc} alt="" style={{ width: '45%', opacity: 0.08, objectFit: 'contain' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', fontWeight: 900, fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', color: dark, marginBottom: 8, paddingBottom: 6, borderBottom: `2px solid ${gold}`, width: '100%' }}>Result</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, color: '#333' }}>
            <span><strong>Name:</strong> {student.name}</span>
            <span><strong>Std:</strong> {student.std}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 10, color: '#333' }}>
            <span><strong>Exam:</strong> {examRecords[0]?.examName}</span>
            <span><strong>Date:</strong> {examRecords[0]?.date ? new Date(examRecords[0].date).toLocaleDateString('en-IN') : '—'}</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: dark }}>
                {['Subject','Max','Obtained','Grade'].map((h, i) => (
                  <th key={h} style={{ color: gold, padding: '7px 10px', textAlign: i === 0 ? 'left' : 'center' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {examRecords.map((r, i) => {
                const p = r.absent ? null : calcPct(r.obtainedMarks, r.maxMarks);
                const gr = gradeInfo(p);
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #e5e7eb', background: i % 2 === 0 ? '#fff' : '#fffdf5' }}>
                    <td style={{ padding: '7px 10px' }}>{r.subject}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'center' }}>{r.maxMarks}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'center' }}>{r.absent ? 'AB' : (r.obtainedMarks ?? '—')}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 900, color: gr.color }}>{gr.label}</td>
                  </tr>
                );
              })}
              <tr style={{ background: '#f5f0e0', fontWeight: 700, borderTop: `2px solid ${gold}` }}>
                <td style={{ padding: '8px 10px' }}>Total</td>
                <td style={{ padding: '8px 10px', textAlign: 'center' }}>{maxTotal}</td>
                <td style={{ padding: '8px 10px', textAlign: 'center' }}>{total}</td>
                <td style={{ padding: '8px 10px', textAlign: 'center' }}>—</td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: 12, background: 'linear-gradient(135deg,#0a0a0a,#1a1a1a,#0a0a0a)', borderRadius: 8, padding: '10px 16px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'rgba(201,168,76,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>Total Marks</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#fff' }}>{total}/{maxTotal}</div>
            </div>
            <div style={{ width: 1, height: 36, background: `${gold}44` }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'rgba(201,168,76,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>Percentage</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: gold }}>{pct != null ? `${pct}%` : '—'}</div>
            </div>
            <div style={{ width: 1, height: 36, background: `${gold}44` }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'rgba(201,168,76,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>Grade</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: g.color, background: '#fff', borderRadius: 6, padding: '0 12px', lineHeight: 1.4 }}>{g.label}</div>
            </div>
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 10, color: '#888' }}>© {new Date().getFullYear()} Shree Ram Academy · Generated {new Date().toLocaleDateString('en-IN')}</div>
        </div>
      </div>
    </div>
  );
}

// Template 2 — Modern (navy/blue)
function PrintCardT2({ student, examRecords, cardRef }) {
  const logoSrc  = useLogoB64();
  const navy     = '#1e3a5f';
  const accent   = '#2d6a9f';
  const total    = examRecords.reduce((s, r) => s + (r.obtainedMarks ?? 0), 0);
  const maxTotal = examRecords.reduce((s, r) => s + r.maxMarks, 0);
  const pct      = calcPct(total, maxTotal);
  const g        = gradeInfo(pct);
  return (
    <div ref={cardRef} style={{ border: `3px solid ${navy}`, borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${navy}, ${accent})`, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <img src="/logo.jpg" alt="logo" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', flexShrink: 0 }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', letterSpacing: '0.12em', fontFamily: 'Helvetica, Arial, sans-serif' }}>SHREE RAM ACADEMY</div>
          <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.18em', marginTop: 3 }}>SINCE 2016 · EXCELLENCE IN EDUCATION</div>
        </div>
      </div>
      {/* Blue title bar */}
      <div style={{ background: `${navy}18`, borderBottom: `2px solid ${navy}22`, padding: '7px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 900, color: navy, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Academic Result</span>
        <span style={{ fontSize: 10, color: accent, fontWeight: 700 }}>{examRecords[0]?.date ? new Date(examRecords[0].date).toLocaleDateString('en-IN') : '—'}</span>
      </div>
      {/* Info */}
      <div style={{ padding: '10px 20px 0', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <img src={logoSrc} alt="" style={{ width: '40%', opacity: 0.06, objectFit: 'contain' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12, fontSize: 12 }}>
            {[['Name', student.name], ['Class', student.std], ['Exam', examRecords[0]?.examName], ['Date', examRecords[0]?.date ? new Date(examRecords[0].date).toLocaleDateString('en-IN') : '—']].map(([l, v]) => (
              <div key={l} style={{ background: `${navy}08`, borderRadius: 6, padding: '5px 10px', border: `1px solid ${navy}18` }}>
                <span style={{ fontSize: 9, color: accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{l}</span>
                <div style={{ fontSize: 12, fontWeight: 700, color: navy, marginTop: 1 }}>{v}</div>
              </div>
            ))}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: navy }}>
                {['Subject','Max Marks','Obtained','%','Grade'].map((h, i) => (
                  <th key={h} style={{ color: '#fff', padding: '8px 10px', textAlign: i === 0 ? 'left' : 'center', fontWeight: 700, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {examRecords.map((r, i) => {
                const p = r.absent ? null : calcPct(r.obtainedMarks, r.maxMarks);
                const gr = gradeInfo(p);
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${navy}15`, background: i % 2 === 0 ? '#fff' : `${navy}05` }}>
                    <td style={{ padding: '7px 10px', color: navy, fontWeight: 600 }}>{r.subject}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'center', color: '#555' }}>{r.maxMarks}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 700, color: navy }}>{r.absent ? 'AB' : (r.obtainedMarks ?? '—')}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'center', color: '#555' }}>{p != null ? `${p}%` : '—'}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 900, color: gr.color }}>{gr.label}</td>
                  </tr>
                );
              })}
              <tr style={{ background: navy, fontWeight: 700 }}>
                <td style={{ padding: '8px 10px', color: '#fff' }}>Total</td>
                <td style={{ padding: '8px 10px', textAlign: 'center', color: '#fff' }}>{maxTotal}</td>
                <td style={{ padding: '8px 10px', textAlign: 'center', color: gold, fontWeight: 900 }}>{total}</td>
                <td style={{ padding: '8px 10px', textAlign: 'center', color: gold, fontWeight: 900 }}>{pct != null ? `${pct}%` : '—'}</td>
                <td style={{ padding: '8px 10px', textAlign: 'center', color: gold, fontWeight: 900 }}>{g.label}</td>
              </tr>
            </tbody>
          </table>
          {/* Overall strip */}
          <div style={{ marginTop: 12, background: `linear-gradient(135deg,${navy},${accent})`, borderRadius: 8, padding: '10px 20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase' }}>Total Marks</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{total}/{maxTotal}</div>
            </div>
            <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.3)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase' }}>Percentage</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: gold }}>{pct != null ? `${pct}%` : '—'}</div>
            </div>
            <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.3)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase' }}>Grade</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: g.color, background: '#fff', borderRadius: 6, padding: '0 12px', lineHeight: 1.4 }}>{g.label}</div>
            </div>
          </div>
          <div style={{ marginTop: 8, marginBottom: 12, textAlign: 'center', fontSize: 9.5, color: '#aaa' }}>© {new Date().getFullYear()} Shree Ram Academy · Generated {new Date().toLocaleDateString('en-IN')}</div>
        </div>
      </div>
    </div>
  );
}

// Template 3 — Emerald / Green
function PrintCardT3({ student, examRecords, cardRef }) {
  const logoSrc  = useLogoB64();
  const green    = '#1a7a4a';
  const light    = '#e8f5ee';
  const mid      = '#2ea866';
  const total    = examRecords.reduce((s, r) => s + (r.obtainedMarks ?? 0), 0);
  const maxTotal = examRecords.reduce((s, r) => s + r.maxMarks, 0);
  const pct      = calcPct(total, maxTotal);
  const g        = gradeInfo(pct);
  return (
    <div ref={cardRef} style={{ border: `3px solid ${green}`, borderRadius: 12, overflow: 'hidden', background: '#fff' }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${green}, ${mid})`, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <img src="/logo.jpg" alt="logo" style={{ width: 58, height: 58, borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', flexShrink: 0 }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', letterSpacing: '0.14em', fontFamily: 'Georgia, serif' }}>SHREE RAM ACADEMY</div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.4)', margin: '5px auto', width: '65%' }} />
          <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.18em' }}>SINCE 2016 · EXCELLENCE IN EDUCATION</div>
        </div>
      </div>

      {/* Green title bar */}
      <div style={{ background: light, borderBottom: `2px solid ${green}33`, padding: '6px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 900, color: green, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Academic Result</span>
        <span style={{ fontSize: 10, color: mid, fontWeight: 700 }}>{examRecords[0]?.date ? new Date(examRecords[0].date).toLocaleDateString('en-IN') : '—'}</span>
      </div>

      {/* Body */}
      <div style={{ padding: '10px 20px 0', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <img src={logoSrc} alt="" style={{ width: '40%', opacity: 0.05, objectFit: 'contain' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12, fontSize: 12 }}>
            {[['Name', student.name], ['Class', student.std], ['Exam', examRecords[0]?.examName], ['Date', examRecords[0]?.date ? new Date(examRecords[0].date).toLocaleDateString('en-IN') : '—']].map(([l, v]) => (
              <div key={l} style={{ background: light, borderRadius: 6, padding: '5px 10px', border: `1px solid ${green}22` }}>
                <span style={{ fontSize: 9, color: mid, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{l}</span>
                <div style={{ fontSize: 12, fontWeight: 700, color: green, marginTop: 1 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: green }}>
                {['Subject', 'Max', 'Obtained', '%', 'Grade'].map((h, i) => (
                  <th key={h} style={{ color: '#fff', padding: '8px 10px', textAlign: i === 0 ? 'left' : 'center', fontWeight: 700, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {examRecords.map((r, i) => {
                const p = r.absent ? null : calcPct(r.obtainedMarks, r.maxMarks);
                const gr = gradeInfo(p);
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${green}18`, background: i % 2 === 0 ? '#fff' : light }}>
                    <td style={{ padding: '7px 10px', color: '#222', fontWeight: 600, borderLeft: `3px solid ${mid}` }}>{r.subject}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'center', color: '#666' }}>{r.maxMarks}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 700, color: green }}>{r.absent ? 'AB' : (r.obtainedMarks ?? '—')}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'center', color: '#555' }}>{p != null ? `${p}%` : '—'}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 900, color: gr.color }}>{gr.label}</td>
                  </tr>
                );
              })}
              <tr style={{ background: green, fontWeight: 700 }}>
                <td style={{ padding: '8px 10px', color: '#fff' }}>Total</td>
                <td style={{ padding: '8px 10px', textAlign: 'center', color: '#fff' }}>{maxTotal}</td>
                <td style={{ padding: '8px 10px', textAlign: 'center', color: '#fff', fontWeight: 900 }}>{total}</td>
                <td style={{ padding: '8px 10px', textAlign: 'center', color: '#fff', fontWeight: 900 }}>{pct != null ? `${pct}%` : '—'}</td>
                <td style={{ padding: '8px 10px', textAlign: 'center', color: '#fff', fontWeight: 900 }}>{g.label}</td>
              </tr>
            </tbody>
          </table>

          {/* Summary strip */}
          <div style={{ marginTop: 12, background: `linear-gradient(135deg, ${green}, ${mid})`, borderRadius: 8, padding: '10px 16px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>Total Marks</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#fff' }}>{total}/{maxTotal}</div>
            </div>
            <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.3)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>Percentage</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#fff' }}>{pct != null ? `${pct}%` : '—'}</div>
            </div>
            <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.3)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>Grade</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: g.color, background: '#fff', borderRadius: 6, padding: '0 12px', lineHeight: 1.4 }}>{g.label}</div>
            </div>
          </div>
          <div style={{ margin: '8px 0 12px', textAlign: 'center', fontSize: 9.5, color: '#aaa' }}>© {new Date().getFullYear()} Shree Ram Academy · Generated {new Date().toLocaleDateString('en-IN')}</div>
        </div>
      </div>
    </div>
  );
}

function PrintCard({ student, examRecords, cardRef: externalRef, template }) {
  const internalRef = useRef(null);
  const cardRef     = externalRef || internalRef;
  if (template === 2) return <PrintCardT2 student={student} examRecords={examRecords} cardRef={cardRef} />;
  if (template === 3) return <PrintCardT3 student={student} examRecords={examRecords} cardRef={cardRef} />;
  return <PrintCardT1 student={student} examRecords={examRecords} cardRef={cardRef} />;
}

// ── Student Modal ────────────────────────────────────────────────────────────
function StudentModal({ student, defaultExam, onClose, students, studentIndex, onNavigate }) {
  const [modalTab, setModalTab]       = useState('add');
  const [examName, setExamName]       = useState(defaultExam || EXAMS[0]);
  const [dateISO, setDateISO]         = useState(new Date().toISOString().slice(0, 10));
  const dateDisplay = new Date(dateISO).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const [rows, setRows]               = useState(() => {
    const cfg = loadStdConfig(student.std);
    const enabled = cfg?.filter(r => r.enabled);
    if (enabled?.length) return enabled.map(r => ({ id: Date.now() + Math.random(), subject: r.subject, maxMarks: r.maxMarks, obtainedMarks: '', absent: false }));
    return [newSubjectRow()];
  });
  const [saving, setSaving]           = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [history, setHistory]         = useState(null);
  const [loadingHist, setLoadingHist] = useState(false);
  const [printData, setPrintData]     = useState(null);
  const [deleting, setDeleting]       = useState(null);
  const [allResults, setAllResults]   = useState([]);
  const [isEditing, setIsEditing]     = useState(false); // kept for Edit button in history
  const [cardTemplate, setCardTemplate] = useState(1);
  const prevStudentId                 = useRef(student._id);

  const defaultRows = (std) => {
    const cfg = loadStdConfig(std);
    const enabled = cfg?.filter(r => r.enabled);
    if (enabled?.length) return enabled.map(r => ({ id: Date.now() + Math.random(), subject: r.subject, maxMarks: r.maxMarks, obtainedMarks: '', absent: false }));
    return [newSubjectRow()];
  };

  // Load all existing marks for current student
  const loadAllResults = async () => {
    try {
      const data = await getStudentResults(student._id);
      setAllResults(data);
      return data;
    } catch { return []; }
  };

  // Returns true if existing result for this exam is within 7 days
  const isWithin7Days = (data, en) => {
    const existing = data.filter(r => r.examName === en);
    if (existing.length === 0) return false;
    const latest = existing.reduce((a, b) =>
      new Date(a.updatedAt || a.createdAt) > new Date(b.updatedAt || b.createdAt) ? a : b
    );
    const diff = (Date.now() - new Date(latest.updatedAt || latest.createdAt)) / (1000 * 60 * 60 * 24);
    return diff < 7;
  };

  // Pre-fill rows from saved data — only if within 7 days
  const prefillRows = (data, en) => {
    const existing = data.filter(r => r.examName === en);
    if (existing.length === 0) return false;
    if (!isWithin7Days(data, en)) return false; // after 7 days → blank form (new entry)
    setRows(existing.map(r => ({
      id: Date.now() + Math.random(),
      subject:       r.subject,
      maxMarks:      String(r.maxMarks),
      obtainedMarks: r.absent ? '' : String(r.obtainedMarks ?? ''),
      absent:        r.absent,
    })));
    const d = existing[0]?.date || existing[0]?.createdAt;
    if (d) setDateISO(new Date(d).toISOString().slice(0, 10));
    return true;
  };

  // Load + prefill whenever student changes (keep modalTab as-is)
  useEffect(() => {
    const en = defaultExam || EXAMS[0];
    setExamName(en);
    setDateISO(new Date().toISOString().slice(0, 10));
    setRows(defaultRows(student.std));
    setPrintData(null);
    setHistory(null);
    setAllResults([]);
    setIsEditing(false);
    prevStudentId.current = student._id;

    getStudentResults(student._id)
      .then(data => {
        setAllResults(data);
        prefillRows(data, en);
        if (modalTab === 'history') {
          const grouped = data.reduce((acc, r) => {
            if (!acc[r.examName]) acc[r.examName] = { records: [], date: r.date };
            acc[r.examName].records.push(r);
            return acc;
          }, {});
          setHistory(grouped);
        }
      })
      .catch(() => {});
  }, [student._id]);

  const handleExamChange = async (en) => {
    setExamName(en);
    setDateISO(new Date().toISOString().slice(0, 10));
    const data = allResults.length ? allResults : await loadAllResults();
    const prefilled = prefillRows(data, en); // only prefills if within 7 days
    if (!prefilled) {
      // no data or older than 7 days → blank form
      const cfg = loadStdConfig(student.std);
      const enabled = cfg?.filter(r => r.enabled);
      if (enabled?.length) {
        setRows(enabled.map(r => ({ id: Date.now() + Math.random(), subject: r.subject, maxMarks: r.maxMarks, obtainedMarks: '', absent: false })));
      } else {
        setRows([newSubjectRow()]);
      }
    }
  };

  const addRow    = () => setRows(p => [...p, newSubjectRow()]);
  const removeRow = (id) => setRows(p => p.length > 1 ? p.filter(r => r.id !== id) : p);
  const setRow    = (id, k, v) => setRows(p => p.map(r => r.id === id ? { ...r, [k]: v } : r));

  const doSave = async () => {
    const validRows = rows.filter(r => r.subject && r.maxMarks);
    if (validRows.length === 0) return toast.error('Add at least one subject');
    setSaving(true);
    try {
      await saveStudentMarks({
        studentId: student._id,
        examName,
        date: dateISO,
        std: student.std,
        subjects: validRows.map(r => ({
          subject:       r.subject,
          maxMarks:      Number(r.maxMarks),
          obtainedMarks: r.absent ? null : (r.obtainedMarks !== '' ? Number(r.obtainedMarks) : null),
          absent:        r.absent,
        })),
      });
      toast.success('Marks saved successfully!');
      await loadAllResults();
      setRows([newSubjectRow()]);
      if (modalTab === 'history') loadHistory();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleSave = async () => {
    const validRows = rows.filter(r => r.subject && r.maxMarks);
    if (validRows.length === 0) return toast.error('Add at least one subject');
    doSave();
  };

  const loadHistory = async () => {
    setLoadingHist(true);
    try {
      const data = await getStudentResults(student._id);
      // Group by examName
      const grouped = data.reduce((acc, r) => {
        if (!acc[r.examName]) acc[r.examName] = { records: [], date: r.date };
        acc[r.examName].records.push(r);
        return acc;
      }, {});
      setHistory(grouped);
    } catch { toast.error('Failed to load history'); }
    finally { setLoadingHist(false); }
  };

  const handleTabChange = (tab) => {
    setModalTab(tab);
    if (tab === 'history' && history === null) loadHistory();
  };

  const handleDeleteExam = async (en) => {
    setDeleting(en);
    try {
      await deleteStudentExam({ studentId: student._id, examName: en });
      toast.success('Exam result deleted');
      loadHistory();
      setPrintData(null);
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(null); }
  };

  const inputSm = "px-2 py-1.5 rounded-lg text-xs outline-none";
  const inputStyle = { border: `1.5px solid ${gold}`, background: '#fffdf5' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: '92vh' }}>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: `2px solid ${gold}22` }}>
          <div className="flex items-center gap-2 min-w-0">
            {/* Prev */}
            <button onClick={() => onNavigate(studentIndex - 1)} disabled={!onNavigate || studentIndex <= 0}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-sm font-black flex-shrink-0 transition-all"
              style={{
                background: studentIndex > 0 ? dark : '#f3f4f6',
                color: studentIndex > 0 ? gold : '#d1d5db',
                border: `1.5px solid ${studentIndex > 0 ? gold : '#e5e7eb'}`,
              }}>‹</button>
            <div className="min-w-0">
              <div className="font-black text-sm truncate" style={{ color: dark }}>{student.name}</div>
              <div className="text-[10px] text-gray-400">Std: {student.std}{student.groupNo ? ` · G${student.groupNo}` : ''}{students ? ` · ${studentIndex + 1}/${students.length}` : ''}</div>
            </div>
            {/* Next */}
            <button onClick={() => onNavigate(studentIndex + 1)} disabled={!onNavigate || studentIndex >= (students?.length - 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-sm font-black flex-shrink-0 transition-all"
              style={{
                background: studentIndex < (students?.length - 1) ? dark : '#f3f4f6',
                color: studentIndex < (students?.length - 1) ? gold : '#d1d5db',
                border: `1.5px solid ${studentIndex < (students?.length - 1) ? gold : '#e5e7eb'}`,
              }}>›</button>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-lg w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 flex-shrink-0">
            <CloseOutlined />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-shrink-0" style={{ borderBottom: `1px solid #f0f0f0` }}>
          {[{ key: 'add', label: 'Add Marks' }, { key: 'history', label: 'History / Preview' }].map(t => (
            <button key={t.key} onClick={() => handleTabChange(t.key)}
              className="flex-1 py-2.5 text-xs font-black transition-colors"
              style={{
                borderBottom: modalTab === t.key ? `2.5px solid ${gold}` : '2.5px solid transparent',
                color: modalTab === t.key ? gold : '#9ca3af',
                background: 'transparent',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 flex flex-col gap-4">

          {/* ── ADD MARKS TAB ── */}
          {modalTab === 'add' && (
            <>
              {/* Exam + Date */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Exam:</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: dark, color: gold, border: `1px solid ${gold}` }}>
                  {examName}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Date:</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: dark, color: gold, border: `1px solid ${gold}` }}>
                  {dateDisplay}
                </span>
              </div>

              {/* Subject Rows */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: gold }}>Subjects & Marks</span>
                </div>

                {/* Header row */}
                <div className="grid text-[10px] font-bold text-gray-400 uppercase px-1"
                  style={{ gridTemplateColumns: '1fr 56px 62px 40px 24px', gap: 4 }}>
                  <span>Subject</span><span className="text-center">Max</span>
                  <span className="text-center">Obtained</span><span className="text-center">Absent</span><span></span>
                </div>

                {rows.map((row) => (
                  <div key={row.id} className="grid items-center"
                    style={{ gridTemplateColumns: '1fr 56px 62px 40px 24px', gap: 4 }}>
                    <select value={row.subject} onChange={e => setRow(row.id, 'subject', e.target.value)}
                      className={inputSm} style={{ ...inputStyle, fontSize: 11 }}>
                      {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <input type="number" value={row.maxMarks} min={1}
                      onChange={e => setRow(row.id, 'maxMarks', e.target.value)}
                      className={`${inputSm} text-center`} style={inputStyle} />
                    <input type="number" value={row.absent ? '' : row.obtainedMarks}
                      disabled={row.absent} min={0} max={Number(row.maxMarks) || undefined}
                      onChange={e => setRow(row.id, 'obtainedMarks', e.target.value)}
                      className={`${inputSm} text-center`}
                      style={{ ...inputStyle, background: row.absent ? '#f9fafb' : '#fffdf5', color: row.absent ? '#9ca3af' : dark }}
                      placeholder="—" />
                    <button onClick={() => setRow(row.id, 'absent', !row.absent)}
                      className="h-7 w-full rounded-lg flex items-center justify-center text-xs font-black"
                      style={{
                        background: row.absent ? '#ef4444' : '#f3f4f6',
                        color: row.absent ? '#fff' : '#9ca3af',
                        border: row.absent ? '1.5px solid #ef4444' : '1.5px solid #e5e7eb',
                      }}>
                      {row.absent ? <CheckOutlined /> : '—'}
                    </button>
                    <button onClick={() => removeRow(row.id)} disabled={rows.length === 1}
                      className="h-7 flex items-center justify-center rounded-lg text-xs"
                      style={{ color: rows.length === 1 ? '#d1d5db' : '#ef4444' }}>
                      <DeleteOutlined />
                    </button>
                  </div>
                ))}
              </div>


              {/* Save + Add Subject buttons */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button onClick={handleSave} disabled={saving}
                  className="py-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1"
                  style={{ background: saving ? '#e5e7eb' : dark, color: saving ? '#9ca3af' : gold, border: `1.5px solid ${saving ? '#e5e7eb' : gold}` }}>
                  {saving ? '...' : 'Save'}
                </button>
                <button onClick={addRow}
                  className="py-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1"
                  style={{ background: '#f3f4f6', color: dark, border: '1.5px solid #e5e7eb' }}>
                  <PlusOutlined /> Subject
                </button>
              </div>
            </>
          )}

          {/* ── HISTORY TAB ── */}
          {modalTab === 'history' && (
            <>
              {loadingHist && <div className="text-center py-8 text-sm text-gray-400">Loading...</div>}

              {!loadingHist && history && Object.keys(history).length === 0 && (
                <div className="text-center py-8 text-sm text-gray-400">No results found</div>
              )}

              {!loadingHist && history && Object.keys(history).length > 0 && !printData && (
                <div className="rounded-xl overflow-hidden" style={{ border: `1.5px solid ${gold}33` }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: dark }}>
                        <th style={{ color: gold, padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Exam</th>
                        <th className="hidden sm:table-cell" style={{ color: gold, padding: '8px 10px', textAlign: 'center', fontSize: 10, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Date</th>
                        <th className="hidden sm:table-cell" style={{ color: gold, padding: '8px 10px', textAlign: 'center', fontSize: 10, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Grade</th>
                        <th style={{ color: gold, padding: '8px 12px', textAlign: 'center', fontSize: 10, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(history).map(([en, { records, date: d }], idx, arr) => {
                        const total    = records.reduce((s, r) => s + (r.obtainedMarks ?? 0), 0);
                        const maxTotal = records.reduce((s, r) => s + r.maxMarks, 0);
                        const p        = calcPct(total, maxTotal);
                        const g        = gradeInfo(p);
                        return (
                          <tr key={en} style={{ borderBottom: idx < arr.length - 1 ? `1px solid ${gold}18` : 'none', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                            <td style={{ padding: '10px 12px' }}>
                              <div className="font-black text-xs" style={{ color: dark }}>{en}</div>
                              <div className="text-[10px] text-gray-400">{records.length} subjects</div>
                              <div className="sm:hidden mt-0.5 flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] text-gray-400">{d ? new Date(d).toLocaleDateString('en-IN') : '—'}</span>
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded"
                                  style={{ background: g.bg, color: g.color }}>{g.label} · {p != null ? `${p}%` : '—'}</span>
                              </div>
                            </td>
                            <td className="hidden sm:table-cell" style={{ padding: '10px 10px', textAlign: 'center', fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>
                              {d ? new Date(d).toLocaleDateString('en-IN') : '—'}
                            </td>
                            <td className="hidden sm:table-cell" style={{ padding: '10px 10px', textAlign: 'center' }}>
                              <span className="text-[11px] font-black px-2 py-0.5 rounded-lg"
                                style={{ background: g.bg, color: g.color }}>{g.label} · {p != null ? `${p}%` : '—'}</span>
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <div className="flex items-center justify-center gap-1.5">
                                <button title="Preview" onClick={() => setPrintData({ examName: en, records })}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg text-xs"
                                  style={{ background: dark, color: gold, border: `1px solid ${gold}` }}>
                                  <EyeOutlined />
                                </button>
                                <button title="Edit" onClick={() => { setIsEditing(true); handleExamChange(en); handleTabChange('add'); }}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg text-xs"
                                  style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                                  <EditOutlined />
                                </button>
                                <button title="Delete" onClick={() => handleDeleteExam(en)} disabled={deleting === en}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg text-xs"
                                  style={{ color: '#ef4444', border: '1px solid #fecaca', background: '#fff5f5' }}>
                                  {deleting === en ? '·' : <DeleteOutlined />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Preview / Print view */}
              {printData && (() => {
                const pcRef = { current: null };
                const pdTotal    = printData.records.reduce((s, r) => s + (r.obtainedMarks ?? 0), 0);
                const pdMaxTotal = printData.records.reduce((s, r) => s + r.maxMarks, 0);
                const pdPct      = calcPct(pdTotal, pdMaxTotal);
                const pdG        = gradeInfo(pdPct);

                const doPrint = () => {
                  const logoUrl  = _logoB64 || '/logo.jpg';
                  const examDate = printData.records[0]?.date ? new Date(printData.records[0].date).toLocaleDateString('en-IN') : '—';
                  const rowsHtml = printData.records.map(r => {
                    const p = r.absent ? null : calcPct(r.obtainedMarks, r.maxMarks);
                    const gr = gradeInfo(p);
                    return `<tr><td>${r.subject}</td><td style="text-align:center">${r.maxMarks}</td><td style="text-align:center">${r.absent ? 'AB' : (r.obtainedMarks ?? '—')}</td><td style="text-align:center;font-weight:900;color:${gr.color}">${gr.label}</td></tr>`;
                  }).join('');
                  const win = window.open('', '_blank');
                  win.document.write(`<html><head><title>Result</title><style>*{box-sizing:border-box}body{margin:0;padding:24px;font-family:Georgia,serif;background:#fff}.card{border:2px solid #C9A84C;border-radius:10px;overflow:hidden;max-width:520px;margin:auto}.nav-hdr{background:linear-gradient(135deg,#0a0a0a,#1a1a1a,#0a0a0a);border-bottom:3px solid #C9A84C;padding:10px 20px;display:flex;align-items:center}.logo{width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid #C9A84C;flex-shrink:0}.bw{flex:1;text-align:center;line-height:1}.bn{font-size:16px;font-weight:900;letter-spacing:.15em;color:#C9A84C;font-family:Georgia,serif}.bs{border:none;border-top:1px solid rgba(201,168,76,.5);margin:4px auto;width:80%}.bi{font-size:9px;font-weight:600;color:rgba(255,255,255,.85);letter-spacing:.2em}.rl{font-size:11px;font-weight:700;color:rgba(255,255,255,.65);letter-spacing:3px;text-transform:uppercase;flex-shrink:0}.body{padding:16px 20px;position:relative}.wm{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:0}.wm img{width:45%;opacity:.08}.ct{position:relative;z-index:1}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#1a1a1a;color:#C9A84C;padding:7px 10px;text-align:left;font-weight:700}td{padding:7px 10px;border-bottom:1px solid #e5e7eb}.tr td{background:#fafafa;font-weight:700}.ft{margin-top:12px;text-align:center;font-size:10px;color:#888}</style></head><body><div class="card"><div class="nav-hdr"><img src="${logoUrl}" class="logo"/><div class="bw"><div class="bn">SHREE RAM ACADEMY</div><hr class="bs"/><div class="bi">Since 2016</div></div><div class="rl">Result</div></div><div class="body"><div class="wm"><img src="${logoUrl}"/></div><div class="ct"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:8px;color:#333"><span><strong>Name:</strong> ${student.name}</span><span><strong>Std:</strong> ${student.std}</span></div><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:12px;color:#333"><span><strong>Exam:</strong> ${printData.records[0]?.examName}</span><span><strong>Date:</strong> ${examDate}</span></div><table><thead><tr><th>Subject</th><th style="text-align:center">Max</th><th style="text-align:center">Obtained</th><th style="text-align:center">Grade</th></tr></thead><tbody>${rowsHtml}<tr class="tr"><td>Total</td><td style="text-align:center">${pdMaxTotal}</td><td style="text-align:center">${pdTotal}</td><td style="text-align:center">—</td></tr></tbody></table><div style="margin-top:12px;display:flex;justify-content:center;gap:24px;font-size:13px"><span><strong>Overall:</strong> <strong style="color:${pdG.color}">${pdPct != null ? pdPct + '%' : '—'}</strong></span><span><strong>Grade:</strong> <strong style="font-size:16px;color:${pdG.color}">${pdG.label}</strong></span></div><div class="ft">© ${new Date().getFullYear()} Shree Ram Academy · Generated ${new Date().toLocaleDateString('en-IN')}</div></div></div></div></body></html>`);
                  win.document.close(); win.focus(); win.print(); win.close();
                };

                const doDownload = async () => {
                  setDownloading(printData.examName);
                  try {
                    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
                    const el = pcRef.current;
                    if (!el) return;
                    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fff', logging: false });
                    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                    const imgW = 210, imgH = (canvas.height / canvas.width) * imgW;
                    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgW, imgH);
                    pdf.save(`ReportCard_${student.name}_${printData.examName}.pdf`);
                  } catch (e) { toast.error('Download failed: ' + e.message); }
                  finally { setDownloading(null); }
                };

                const doWhatsApp = async () => {
                  // 1. Download the PDF first
                  try {
                    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
                    const el = pcRef.current;
                    if (el) {
                      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fff', logging: false });
                      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                      const imgW = 210, imgH = (canvas.height / canvas.width) * imgW;
                      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgW, imgH);
                      pdf.save(`ReportCard_${student.name}_${printData.examName}.pdf`);
                    }
                  } catch { /* ignore download errors, still open WhatsApp */ }
                  // 2. Open WhatsApp with a short note
                  const msg = `Result for ${student.name} (${student.std}) — ${printData.examName}\nPlease find the PDF attached.`;
                  const mobile = (student.mobile || student.phone || '').replace(/\D/g, '');
                  const num = mobile ? (mobile.startsWith('91') ? mobile : `91${mobile}`) : '';
                  toast.success('PDF downloaded! Open WhatsApp and attach the file.', { duration: 4000 });
                  setTimeout(() => window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank'), 800);
                };

                return (
                  <div className="flex flex-col gap-3">
                    {/* Toolbar: Back + 3 action buttons */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => setPrintData(null)}
                        className="flex items-center gap-1 text-[10px] font-bold px-2 py-1.5 rounded-lg flex-shrink-0"
                        style={{ background: '#f3f4f6', color: '#374151' }}>
                        ← Back
                      </button>
                      <div className="flex gap-1.5 flex-1">
                        <button onClick={doDownload} disabled={downloading === printData.examName}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-black"
                          style={{ background: downloading === printData.examName ? '#d1fae5' : '#16a34a', color: '#fff', border: 'none' }}>
                          <DownloadOutlined style={{ fontSize: 10 }} /> {downloading === printData.examName ? '...' : 'PDF'}
                        </button>
                        <button onClick={doWhatsApp}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-black"
                          style={{ background: '#25D366', color: '#fff', border: 'none' }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          WhatsApp
                        </button>
                        <button onClick={doPrint}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-black"
                          style={{ background: dark, color: gold, border: `1.5px solid ${gold}` }}>
                          <PrinterOutlined style={{ fontSize: 10 }} /> Print
                        </button>
                      </div>
                    </div>
                    {/* Template selector */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Design:</span>
                      {[1, 2, 3].map(t => (
                        <button key={t} onClick={() => setCardTemplate(t)}
                          className="px-3 py-1 rounded-lg text-[10px] font-black transition-all"
                          style={{
                            background: cardTemplate === t ? dark : '#f3f4f6',
                            color:      cardTemplate === t ? gold : '#6b7280',
                            border:     `1.5px solid ${cardTemplate === t ? gold : '#e5e7eb'}`,
                          }}>
                          T{t}
                        </button>
                      ))}
                    </div>
                    <PrintCard student={student} examRecords={printData.records} cardRef={pcRef} template={cardTemplate} />
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>

    </div>
  );
}

// ── Step Indicator ───────────────────────────────────────────────────────────
function StepBar({ current, steps }) {
  return (
    <div className="flex items-center w-full">
      {steps.map((s, i) => {
        const done   = current > s.n;
        const active = current === s.n;
        return (
          <div key={s.n} className="flex items-center" style={{ flex: i < steps.length - 1 ? '1' : 'none' }}>
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all"
                style={{
                  background: done ? gold : active ? dark : '#e5e7eb',
                  color:      done ? dark : active ? gold : '#9ca3af',
                  border:     active ? `2px solid ${gold}` : done ? 'none' : '2px solid #e5e7eb',
                  boxShadow:  active ? `0 0 0 3px ${gold}33` : 'none',
                }}>
                {done ? <CheckOutlined style={{ fontSize: 10 }} /> : s.n}
              </div>
              <span className="text-[9px] font-black uppercase tracking-wide whitespace-nowrap"
                style={{ color: done ? gold : active ? dark : '#9ca3af' }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-1 mb-4"
                style={{ background: done ? gold : '#e5e7eb', transition: 'background 0.3s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step Card ────────────────────────────────────────────────────────────────
function StepCard({ n, label, current, summary, headerRight, children }) {
  const done   = current > n;
  const active = current === n;
  const locked = current < n;
  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: '#fff',
        border: `1.5px solid ${active ? gold : done ? `${gold}55` : '#e5e7eb'}`,
        opacity: locked ? 0.45 : 1,
      }}>
      <div className={`flex px-4 py-3 gap-2 ${headerRight ? 'flex-col sm:flex-row sm:items-center sm:justify-between' : 'items-center justify-between'}`}
        style={{ borderBottom: active ? `1px solid ${gold}22` : 'none' }}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
            style={{ background: done ? gold : active ? dark : '#e5e7eb', color: done ? dark : active ? gold : '#9ca3af' }}>
            {done ? <CheckOutlined style={{ fontSize: 8 }} /> : n}
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: active ? gold : done ? gold : '#9ca3af' }}>
            {label}
          </span>
          {done && summary && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${gold}18`, color: gold }}>{summary}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {headerRight}
          {done && !headerRight && <CheckOutlined style={{ color: gold, fontSize: 12 }} />}
          {locked && <span className="text-[10px] text-gray-300">🔒</span>}
        </div>
      </div>
      {active && <div className="px-4 pb-4 pt-3">{children}</div>}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function Result() {
  const [step, setStep]                 = useState(1);
  const [selectedStd, setSelectedStd]   = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [savedSubjects, setSavedSubjects] = useState([]);
  const [search, setSearch]             = useState('');
  const [students, setStudents]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [loaded, setLoaded]             = useState(false);
  const [activeStudent, setActiveStudent] = useState(null);
  const [activeIndex, setActiveIndex]     = useState(0);

  const openStudent = (index) => {
    const list = students.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()));
    if (index < 0 || index >= list.length) return;
    setActiveStudent(list[index]);
    setActiveIndex(index);
  };

  const STEPS = [
    { n: 1, label: 'Class'    },
    { n: 2, label: 'Exam'     },
    { n: 3, label: 'Subjects' },
    { n: 4, label: 'Student'  },
  ];

  const loadStudents = async (std) => {
    setLoading(true); setLoaded(false); setStudents([]);
    try {
      const res = await getStudents({ std, limit: 200 });
      setStudents(res.data || []);
      setLoaded(true);
    } catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  };

  const handleStdSelect = (cls) => {
    setSelectedStd(cls);
    setSelectedExam('');
    setSavedSubjects([]);
    setStudents([]); setLoaded(false);
    setStep(2);
  };

  const handleExamNext = () => {
    if (!selectedExam) return toast.error('Please select an exam');
    setStep(3);
  };

  const handleSubjectsSaved = (subjects) => {
    setSavedSubjects(subjects);
    loadStudents(selectedStd);
    setStep(4);
  };

  const filtered = students.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-xl font-black flex items-center gap-2" style={{ color: dark }}>
            <TrophyOutlined style={{ color: gold }} /> Result
          </h1>
          <p className="text-[10px] text-gray-400 mt-0.5">ℹ️ Select and follow steps to create result</p>
        </div>
        {step > 1 && (
          <button onClick={() => { setStep(1); setSelectedStd(''); setSelectedExam(''); setSavedSubjects([]); setStudents([]); setLoaded(false); }}
            className="text-[10px] font-bold px-3 py-1.5 rounded-xl"
            style={{ background: '#f3f4f6', color: '#6b7280', border: '1.5px solid #e5e7eb' }}>
            ↺ Reset
          </button>
        )}
      </div>

      {/* Step Bar */}
      <StepBar current={step} steps={STEPS} />

      {/* Steps 1 + 2 + 3 — one row on desktop (20 / 35 / 45 %), stacked on mobile */}
      <div className="flex flex-col md:flex-row gap-3 md:items-start">

        {/* Step 1 — 15% */}
        <div className="md:w-[15%]">
          <StepCard n={1} label="Select Class" current={step} summary={selectedStd}>
            <div className="grid grid-cols-2 gap-2">
              {STD_OPTIONS.map(cls => (
                <button key={cls} onClick={() => handleStdSelect(cls)}
                  className="px-3 py-2 rounded-xl text-xs font-black transition-all"
                  style={{
                    background: selectedStd === cls ? dark : '#f9fafb',
                    color:      selectedStd === cls ? gold : '#374151',
                    border:     `1.5px solid ${selectedStd === cls ? gold : '#e5e7eb'}`,
                  }}>
                  {cls}
                </button>
              ))}
            </div>
          </StepCard>
        </div>

        {/* Step 2 — 35% */}
        <div className="md:w-[35%]" >
          <StepCard n={2} label="Select Exam" current={step} summary={selectedExam}>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                {EXAMS.map(e => (
                  <button key={e} onClick={() => setSelectedExam(e)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all"
                    style={{
                      background: selectedExam === e ? dark : '#f9fafb',
                      color:      selectedExam === e ? gold : '#374151',
                      border:     `1.5px solid ${selectedExam === e ? gold : '#e5e7eb'}`,
                    }}>
                    {e}
                  </button>
                ))}
              </div>
              <button onClick={handleExamNext}
                className="py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2"
                style={{ background: selectedExam ? dark : '#e5e7eb', color: selectedExam ? gold : '#9ca3af', border: `1.5px solid ${selectedExam ? gold : '#e5e7eb'}` }}>
                Next →
              </button>
            </div>
          </StepCard>
        </div>

        {/* Step 3 — 50% */}
        <div className="md:w-[50%]">
          <StepCard n={3} label="Select Subjects" current={step}
            summary={savedSubjects.length ? `${savedSubjects.length} subjects` : ''}>
            <StdSubjectConfig std={selectedStd} onSaved={handleSubjectsSaved} />
          </StepCard>
        </div>

      </div>

      {/* Step 4 — Select Student */}
      <StepCard n={4} label="Select Student" current={step}
        summary={loaded ? `${filtered.length} students` : ''}
        headerRight={loaded && students.length > 0 ? (
          <input type="text" value={search} placeholder="Search..."
            onChange={e => setSearch(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl text-xs outline-none w-full sm:w-64"
            style={{ border: '1px solid #e5e7eb', background: '#f9fafb' }} />
        ) : null}>
        <div className="flex flex-col gap-3">

          {loading && <div className="py-8 text-center text-sm text-gray-400">Loading...</div>}

          {loaded && filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-400">
              {students.length === 0 ? `No students in ${selectedStd}` : 'No match found'}
            </div>
          )}

          {loaded && filtered.length > 0 && (
            <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
              {filtered.map(s => (
                <button key={s._id} onClick={() => openStudent(filtered.indexOf(s))}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left transition-all"
                  style={{ border: `1.5px solid #e5e7eb`, background: '#fafafa' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.background = '#fffdf5'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fafafa'; }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
                    style={{ background: dark, color: gold }}>
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-black" style={{ color: dark, whiteSpace: 'nowrap' }}>{s.name}</span>
                    <span className="text-[9px] font-bold" style={{ color: gold }}>
                      <TrophyOutlined style={{ fontSize: 8 }} /> Result
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </StepCard>

      {/* Modal */}
      {activeStudent && (
        <StudentModal
          student={activeStudent}
          defaultExam={selectedExam}
          onClose={() => setActiveStudent(null)}
          students={filtered}
          studentIndex={activeIndex}
          onNavigate={openStudent}
        />
      )}
    </div>
  );
}
