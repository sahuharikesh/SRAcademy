import { useState, useRef, useEffect } from 'react';
import { PlusOutlined, DeleteOutlined, DownloadOutlined, PrinterOutlined, PictureOutlined } from '@ant-design/icons';

async function processImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      // Draw at original size
      const c1 = document.createElement('canvas');
      c1.width = img.width; c1.height = img.height;
      const ctx1 = c1.getContext('2d');
      ctx1.drawImage(img, 0, 0);

      // Find bounding box of non-white pixels
      const { data, width, height } = ctx1.getImageData(0, 0, c1.width, c1.height);
      let minX = width, minY = height, maxX = 0, maxY = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          if (data[i+3] > 10 && (data[i] < 235 || data[i+1] < 235 || data[i+2] < 235)) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      // Fallback if all white
      if (minX > maxX) { minX = 0; minY = 0; maxX = width - 1; maxY = height - 1; }

      const pad = 4;
      minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
      maxX = Math.min(width - 1, maxX + pad); maxY = Math.min(height - 1, maxY + pad);

      // Crop + resize to 100×100 + make white transparent
      const c2 = document.createElement('canvas');
      c2.width = 90; c2.height = 90;
      const ctx2 = c2.getContext('2d');
      ctx2.drawImage(c1, minX, minY, maxX - minX + 1, maxY - minY + 1, 0, 0, 90, 90);

      const imgData = ctx2.getImageData(0, 0, 90, 90);
      for (let i = 0; i < imgData.data.length; i += 4) {
        if (imgData.data[i] > 230 && imgData.data[i+1] > 230 && imgData.data[i+2] > 230)
          imgData.data[i+3] = 0;
      }
      ctx2.putImageData(imgData, 0, 0);

      URL.revokeObjectURL(url);
      resolve(c2.toDataURL('image/png'));
    };
    img.src = url;
  });
}

const SUBJECTS = ['Maths','Maths-1','Maths-2','Science','Science-1','Science-2','English','Marathi','Hindi','History/Civics','Geography','Sanskrit'];
const EXAMS    = ['Half Yearly Exam', 'Annual Exam', 'Unit Test 1', 'Unit Test 2', 'Unit Test 3', 'Final Exam', 'Monthly Test', 'Weekly Test'];
const CLASSES  = ['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'];
const gold = '#C9A84C';
const dark = '#1a1a1a';

function PaperPreview({ meta, questions, logoSrc }) {
  return (
    <div style={{
      width: '760px',
      background: '#fff', fontFamily: 'Georgia, "Times New Roman", serif',
      padding: '14px 28px 10px',
      boxSizing: 'border-box', position: 'relative', overflow: 'hidden',
      border: '1px solid #ccc',
    }}>
      {/* Watermark */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 0 }}>
        <img src={logoSrc} alt="" style={{ width: '45%', opacity: 0.03, objectFit: 'contain', userSelect: 'none' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', borderBottom: `2px double ${dark}`, paddingBottom: 10, marginBottom: 5 }}>
          <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: 3, color: dark, textTransform: 'uppercase', lineHeight: 1 }}>
            Shree Ram Academy
          </div>
          <div style={{ fontSize: 11, color: '#333', marginTop: 6, textAlign: 'left' }}>
            <div style={{ display: 'flex' }}>
              <span style={{ flex: 1 }}>Std: <strong>{meta.class || '___'}</strong></span>
              <span style={{ flex: 1, textAlign: 'center' }}><strong>{meta.examName || '___'}</strong></span>
              <span style={{ flex: 1, textAlign: 'right' }}>Time: <strong>{meta.time || '___'}</strong></span>
            </div>
            <div style={{ display: 'flex', marginTop: 4 }}>
              <span style={{ flex: 1 }}>Total Marks: <strong>{meta.maxMarks || '___'}</strong></span>
              <span style={{ flex: 1, textAlign: 'center' }}>Subject: <strong>{meta.subject || '___________'}</strong></span>
              <span style={{ flex: 1, textAlign: 'right' }}>Date: <strong>{meta.date || '___________'}</strong></span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {meta.instructions && (
          <div style={{ marginBottom: 8, fontSize: 10.5, color: '#333', borderLeft: `3px solid ${gold}`, paddingLeft: 8 }}>
            <strong>Instructions:</strong> {meta.instructions}
          </div>
        )}

        {/* Questions */}
        <div style={{ fontSize: 12, color: dark }}>
          {questions.map((q, qi) => (
            <div key={q.id} style={{ marginBottom: 9 }}>
              {/* Question row: number + 60/40 split if image, else full width */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 6, flex: 1, alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 700, flexShrink: 0 }}>Q{qi + 1}.</span>
                  {q.image ? (
                    <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <div style={{ width: '60%' }}>{q.text || <span style={{ color: '#aaa' }}>Question text...</span>}</div>
                      <div style={{ width: '40%', display: 'flex', justifyContent: 'flex-end' }}>
                        <img src={q.image} alt="diagram" style={{ width: 90, height: 90, objectFit: 'contain' }} />
                      </div>
                    </div>
                  ) : (
                    <div style={{ flex: 1 }}>{q.text || <span style={{ color: '#aaa' }}>Question text...</span>}</div>
                  )}
                </div>
                {q.marks && <span style={{ fontWeight: 700, flexShrink: 0, color: '#555', fontSize: 10.5 }}>[{q.marks} {Number(q.marks) === 1 ? 'Mark' : 'Marks'}]</span>}
              </div>
              {q.subQuestions.filter(s => s.text || s.image).length > 0 && (
                <div style={{ marginLeft: 22, marginTop: 4 }}>
                  {q.subQuestions.map((sq, si) => (sq.text || sq.image) ? (
                    <div key={sq.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 3, alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: 5, flex: 1, alignItems: 'flex-start' }}>
                        <span style={{ flexShrink: 0 }}>({String.fromCharCode(97 + si)})</span>
                        {sq.image ? (
                          <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <div style={{ width: '60%' }}>{sq.text}</div>
                            <div style={{ width: '40%', display: 'flex', justifyContent: 'flex-end' }}>
                              <img src={sq.image} alt="diagram" style={{ width: 90, height: 90, objectFit: 'contain' }} />
                            </div>
                          </div>
                        ) : (
                          <span>{sq.text}</span>
                        )}
                      </div>
                      {sq.marks && <span style={{ fontWeight: 700, flexShrink: 0, color: '#555', fontSize: 10.5 }}>[{sq.marks}]</span>}
                    </div>
                  ) : null)}
                </div>
              )}
            </div>
          ))}
          {questions.length === 0 && (
            <div style={{ color: '#aaa', textAlign: 'center', padding: '12px 0', fontSize: 11 }}>
              Koi question nahi — left panel se add karein 
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

let idSeq = 1;
const newQ  = () => ({ id: idSeq++, text: '', marks: '', image: null, subQuestions: [] });
const newSQ = () => ({ id: idSeq++, text: '', marks: '', image: null });

export default function QuestionPaper() {
  const logoSrc = '/logo.jpg';
  const [meta, setMeta] = useState({
    examName: 'Half Yearly Exam', subject: '', class: '6th',
    date: '', time: '3 Hours', maxMarks: '100', instructions: 'All questions are compulsory.',
  });
  const [questions, setQuestions] = useState([newQ()]);
  const [setsPerPage, setSetsPerPage] = useState(1);

  const setM = (k, v) => setMeta(p => ({ ...p, [k]: v }));

  const addQ  = () => setQuestions(p => [...p, newQ()]);
  const delQ  = (id) => setQuestions(p => p.filter(q => q.id !== id));
  const setQ  = (id, k, v) => setQuestions(p => p.map(q => q.id === id ? { ...q, [k]: v } : q));
  const addSQ = (qid) => setQuestions(p => p.map(q => q.id === qid ? { ...q, subQuestions: [...q.subQuestions, newSQ()] } : q));
  const delSQ = (qid, sid) => setQuestions(p => p.map(q => q.id === qid ? { ...q, subQuestions: q.subQuestions.filter(s => s.id !== sid) } : q));
  const setSQ = (qid, sid, k, v) => setQuestions(p => p.map(q => q.id === qid ? {
    ...q, subQuestions: q.subQuestions.map(s => s.id === sid ? { ...s, [k]: v } : s)
  } : q));

  const handleDownload = async () => {
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'), import('jspdf'),
    ]);

    const A4_W = 210;
    const A4_H = 297;

    if (setsPerPage === 1) {
      // Single set → one A4 page, start from top
      const el = document.getElementById('qp-set-0');
      if (!el) return;
      const canvas = await html2canvas(el, {
        scale: 2, useCORS: true, backgroundColor: '#fff',
        scrollX: 0, scrollY: 0,
        onclone: (_d, c) => { c.style.width = '760px'; c.style.minWidth = '0'; },
      });
      const imgW = A4_W;
      const imgH = (canvas.height / canvas.width) * A4_W;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgW, imgH);
      pdf.save(`QuestionPaper_${meta.subject || 'paper'}_Class${meta.class}.pdf`);

    } else {
      // 2 or 3 sets → all on one A4 page, stacked tightly
      const n = setsPerPage;
      const canvases = await Promise.all(
        Array.from({ length: n }, (_, i) => {
          const el = document.getElementById(`qp-set-${i}`);
          if (!el) return null;
          return html2canvas(el, {
            scale: 2, useCORS: true, backgroundColor: '#fff',
            scrollX: 0, scrollY: 0,
            onclone: (_d, c) => { c.style.width = '760px'; c.style.minWidth = '0'; },
          });
        })
      );
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const slotH = A4_H / n;
      const gap = 1.5;
      canvases.forEach((canvas, i) => {
        if (!canvas) return;
        const imgW = A4_W;
        const imgH = Math.min((canvas.height / canvas.width) * A4_W, slotH - gap);
        const yOffset = i * slotH;
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, yOffset, imgW, imgH);
      });
      // Dashed cut lines between sets
      pdf.setDrawColor(150);
      pdf.setLineDashPattern([2, 2], 0);
      for (let i = 1; i < n; i++) {
        pdf.line(0, (A4_H / n) * i, A4_W, (A4_H / n) * i);
      }
      pdf.save(`QuestionPaper_${meta.subject || 'paper'}_Class${meta.class}.pdf`);
    }
  };

  const handlePrint = () => {
    const el = document.getElementById('qp-all-sets');
    if (!el) return;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Question Paper</title><style>body{margin:0;padding:0;font-family:Georgia,serif;}@media print{body{margin:0}.cut-line{page-break-after:always;}}</style></head><body>${el.outerHTML}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const [mobileTab, setMobileTab] = useState('form');
  const previewWrapRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);

  // Scale preview to fit available width on small screens
  useEffect(() => {
    const el = previewWrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setPreviewScale(Math.min(1, (w - 8) / 760));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const inputCls = "px-2 py-1.5 rounded-lg text-xs outline-none w-full";
  const inputStyle = { border: `1.5px solid ${gold}`, background: '#fffdf5' };

  return (
    <div className="flex flex-col gap-3">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-md sm:text-xl font-black" style={{ color: dark }}>Question Paper Designer </h1>
          <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">Fill details and questions — preview updates live</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-black"
            style={{ background: '#f3f4f6', color: '#374151', border: '1.5px solid #d1d5db' }}>
            <PrinterOutlined /> <span className="hidden sm:inline">Print</span>
          </button>
          <button onClick={handleDownload}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-black"
            style={{ background: `linear-gradient(135deg,${dark},#2a2a2a)`, color: gold, border: `1.5px solid ${gold}` }}>
            <DownloadOutlined /> <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* ── Mobile Tabs ── */}
      <div className="flex lg:hidden rounded-xl overflow-hidden border" style={{ border: `1.5px solid ${gold}33` }}>
        {['form', 'preview'].map(tab => (
          <button key={tab} onClick={() => setMobileTab(tab)}
            className="flex-1 py-2 text-xs font-black capitalize"
            style={{
              background: mobileTab === tab ? dark : '#f9fafb',
              color: mobileTab === tab ? gold : '#6b7280',
            }}>
            {tab === 'form' ? 'Form' : 'Preview'}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4" style={{ minHeight: 0 }}>
        {/* ── Left Panel: Form ── */}
        <div className={`${mobileTab === 'form' ? 'flex' : 'hidden lg:flex'} w-full lg:w-96 flex-shrink-0 flex-col gap-3 overflow-y-auto`}
          style={{ maxHeight: 'calc(100vh - 160px)' }}>

          {/* Meta */}
          <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#fff', border: `1.5px solid ${gold}33` }}>
            <div className="text-xs font-black uppercase tracking-widest" style={{ color: gold }}>Paper Details</div>
            <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Exam Name', key: 'examName', type: 'select', opts: EXAMS, full: true },
              { label: 'Subject',   key: 'subject',  type: 'select', opts: SUBJECTS },
              { label: 'Class',     key: 'class',    type: 'select', opts: CLASSES  },
              { label: 'Date',      key: 'date',     type: 'date'   },
              { label: 'Time',      key: 'time',     type: 'text', placeholder: 'e.g. 3 Hours' },
              { label: 'Max Marks', key: 'maxMarks', type: 'number' },
            ].map(({ label, key, type, opts, placeholder, full }) => (
              <div key={key} className={full ? 'col-span-2' : ''}>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">{label}</label>
                {type === 'select' ? (
                  <select value={meta[key]} onChange={e => setM(key, e.target.value)} className={inputCls} style={inputStyle}>
                    {opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={type} value={meta[key]} placeholder={placeholder}
                    onChange={e => setM(key, e.target.value)} className={inputCls} style={inputStyle} />
                )}
              </div>
            ))}
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Instructions</label>
              <textarea value={meta.instructions} onChange={e => setM('instructions', e.target.value)} rows={2}
                className={inputCls} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Sets per Page</label>
              <div className="flex gap-2">
                {[1, 2, 3].map(n => (
                  <button key={n} onClick={() => setSetsPerPage(n)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-black"
                    style={{
                      border: `1.5px solid ${setsPerPage === n ? gold : '#d1d5db'}`,
                      background: setsPerPage === n ? dark : '#f9fafb',
                      color: setsPerPage === n ? gold : '#374151',
                    }}>
                    {n} Set{n > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#fff', border: `1.5px solid ${gold}33` }}>
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase tracking-widest" style={{ color: gold }}>Questions</div>
              <button onClick={addQ}
                className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-black"
                style={{ background: dark, color: gold, border: `1px solid ${gold}` }}>
                <PlusOutlined /> Add
              </button>
            </div>

            {questions.map((q, qi) => (
              <div key={q.id} className="rounded-xl p-3 flex flex-col gap-2" style={{ background: '#fafafa', border: '1px solid #e5e7eb' }}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-gray-500">Q{qi + 1}</span>
                  <input value={q.text} onChange={e => setQ(q.id, 'text', e.target.value)}
                    placeholder="Question text..." className="flex-1 px-2 py-1 rounded-lg text-xs outline-none"
                    style={{ border: '1px solid #d1d5db', background: '#fff' }} />
                  <input type="number" value={q.marks} onChange={e => setQ(q.id, 'marks', e.target.value)}
                    placeholder="Marks" className="w-14 px-2 py-1 rounded-lg text-xs outline-none"
                    style={{ border: '1px solid #d1d5db', background: '#fff' }} />
                  <label title="Add diagram image" className="cursor-pointer text-xs" style={{ color: q.image ? '#25D366' : gold }}>
                    <PictureOutlined />
                    <input type="file" accept="image/*" className="hidden" onChange={async e => {
                      if (e.target.files[0]) { const img = await processImage(e.target.files[0]); setQ(q.id, 'image', img); e.target.value = ''; }
                    }} />
                  </label>
                  <button onClick={() => delQ(q.id)} className="text-red-400 hover:text-red-600 text-xs"><DeleteOutlined /></button>
                </div>

                {/* Image preview in form */}
                {q.image && (
                  <div className="flex items-center gap-2 pl-6">
                    <img src={q.image} alt="diagram" className="rounded border" style={{ width: 60, height: 60, objectFit: 'contain', background: '#f0f0f0' }} />
                    <button onClick={() => setQ(q.id, 'image', null)} className="text-[10px] text-red-400">Remove</button>
                  </div>
                )}

                {/* Sub-questions */}
                {q.subQuestions.map((sq, si) => (
                  <div key={sq.id} className="flex flex-col gap-1 pl-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">({String.fromCharCode(97 + si)})</span>
                      <input value={sq.text} onChange={e => setSQ(q.id, sq.id, 'text', e.target.value)}
                        placeholder="Sub-question..." className="flex-1 px-2 py-1 rounded-lg text-[11px] outline-none"
                        style={{ border: '1px solid #e5e7eb', background: '#fff' }} />
                      <input type="number" value={sq.marks} onChange={e => setSQ(q.id, sq.id, 'marks', e.target.value)}
                        placeholder="Marks" className="w-12 px-2 py-1 rounded-lg text-[11px] outline-none"
                        style={{ border: '1px solid #e5e7eb', background: '#fff' }} />
                      <label title="Add diagram image" className="cursor-pointer text-xs" style={{ color: sq.image ? '#25D366' : gold }}>
                        <PictureOutlined />
                        <input type="file" accept="image/*" className="hidden" onChange={async e => {
                          if (e.target.files[0]) { const img = await processImage(e.target.files[0]); setSQ(q.id, sq.id, 'image', img); e.target.value = ''; }
                        }} />
                      </label>
                      <button onClick={() => delSQ(q.id, sq.id)} className="text-red-300 hover:text-red-500 text-xs"><DeleteOutlined /></button>
                    </div>
                    {sq.image && (
                      <div className="flex items-center gap-2 pl-4">
                        <img src={sq.image} alt="diagram" className="rounded border" style={{ width: 50, height: 50, objectFit: 'contain', background: '#f0f0f0' }} />
                        <button onClick={() => setSQ(q.id, sq.id, 'image', null)} className="text-[10px] text-red-400">Remove</button>
                      </div>
                    )}
                  </div>
                ))}

                <button onClick={() => addSQ(q.id)}
                  className="text-[10px] font-semibold text-left pl-4 flex items-center gap-1"
                  style={{ color: gold }}>
                  <PlusOutlined /> Sub-question
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Panel: Preview ── */}
        <div ref={previewWrapRef}
          className={`${mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'} flex-1 min-w-0 rounded-2xl overflow-auto flex-col`}
          style={{ background: '#f0f2f5', padding: 12, border: '1.5px solid #e5e7eb', maxHeight: 'calc(100vh - 160px)' }}>
          <div id="qp-all-sets"
            style={{
              width: 760,
              transformOrigin: 'top left',
              transform: `scale(${previewScale})`,
              marginBottom: previewScale < 1 ? `calc((${previewScale} - 1) * 760px * ${setsPerPage} * 0.5)` : 0,
              display: 'flex', flexDirection: 'column', gap: 16,
            }}>
            {Array.from({ length: setsPerPage }).map((_, i) => (
              <div key={i} id={`qp-set-${i}`} style={{ width: 760 }}>
                <PaperPreview meta={meta} questions={questions} logoSrc={logoSrc} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
