import { useRef, useState } from 'react';
import AppModal from '../common/AppModal';
import { DownloadOutlined, PrinterOutlined, WhatsAppOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import { formatLong } from '../../utils/dates';

function mergeFees(paidFees) {
  const map = {};
  paidFees.forEach((f) => {
    const sid  = f.studentId?._id || f.studentId || '';
    const key  = `${sid}__${f.month}__${f.year}`;
    if (map[key]) {
      map[key].paidAmount = (map[key].paidAmount || 0) + (f.paidAmount || f.amount || 0);
      map[key].amount     = (map[key].amount     || 0) + (f.amount || 0);
    } else {
      map[key] = { ...f, paidAmount: f.paidAmount || f.amount || 0 };
    }
  });
  return Object.values(map);
}

function GroupReceiptView({ groupNo, groupStudents, paidFees, receiptRef }) {
  paidFees = mergeFees(paidFees);
  const gold  = '#C9A84C';
  const dark  = '#1a1a1a';
  const cream = '#fdf8ee';

  const totalPaid  = paidFees.reduce((s, f) => s + (f.paidAmount || f.amount || 0), 0);
  const receiptNo  = `GRP-${groupNo}-${Date.now().toString().slice(-6)}`;
  const today      = formatLong(new Date());

  return (
    <div ref={receiptRef} style={{
      width: '100%', maxWidth: 680, margin: '0 auto',
      background: cream,
      border: `10px solid ${dark}`,
      outline: `4px solid ${gold}`,
      outlineOffset: '-16px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Georgia, "Times New Roman", serif',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    }}>

      {/* Watermark */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ fontSize: 38, fontWeight: 900, color: gold, opacity: 0.04, whiteSpace: 'nowrap', letterSpacing: 8, fontFamily: 'Arial, sans-serif', lineHeight: 2, transform: 'rotate(-15deg)', userSelect: 'none' }}>
            SHREE RAM ACADEMY &nbsp;&nbsp; SHREE RAM ACADEMY
          </div>
        ))}
      </div>

      {/* Corner ornaments */}
      {[{ top: 8, left: 8, br: '0 0 100% 0' }, { top: 8, right: 8, br: '0 0 0 100%' }, { bottom: 8, left: 8, br: '0 100% 0 0' }, { bottom: 8, right: 8, br: '100% 0 0 0' }].map((s, i) => (
        <div key={i} style={{ position: 'absolute', width: 36, height: 36, border: `3px solid ${gold}`, borderRadius: s.br, zIndex: 1, ...s }} />
      ))}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, padding: '28px 36px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 16, borderBottom: `2px solid ${gold}`, paddingBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 6 }}>
            <img src="/logo.png" alt="logo" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${gold}` }}
              onError={(e) => { e.target.style.display = 'none'; }} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: dark, letterSpacing: 1 }}>Shree Ram Academy</div>
              <div style={{ fontSize: 10, color: '#888', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Arial' }}>Fee Payment Receipt</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#666', fontFamily: 'Arial', marginTop: 6 }}>
            <span>Receipt No: <strong style={{ color: dark }}>{receiptNo}</strong></span>
            <span>Date: <strong style={{ color: dark }}>{today}</strong></span>
          </div>
        </div>

        {/* PAID stamp */}
        <div style={{ position: 'absolute', top: 36, right: 44, transform: 'rotate(12deg)', border: '3px solid #15803d', borderRadius: 4, padding: '2px 10px', zIndex: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: '#15803d', letterSpacing: 3, fontFamily: 'Arial' }}>PAID</span>
        </div>

        {/* Students summary */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'Arial', marginBottom: 6 }}>Group Students</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {groupStudents.map((s) => (
              <div key={s._id} style={{ background: '#fff', border: `1px solid ${gold}`, borderRadius: 6, padding: '4px 10px', fontSize: 11, fontFamily: 'Arial' }}>
                <span style={{ fontWeight: 700, color: dark }}>{s.name}</span>
                <span style={{ color: '#888', marginLeft: 6 }}>Class {s.std}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fee table */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'Arial', marginBottom: 6 }}>Payment Details</div>
          <div style={{ background: '#fff', border: `1.5px solid ${gold}`, borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: dark }}>
                  {['#', 'Student', 'Month / Year', 'Fee', 'Paid', 'Status'].map((h) => (
                    <th key={h} style={{ padding: '7px 10px', color: gold, fontFamily: 'Arial', fontSize: 10, textAlign: 'left', fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paidFees.map((f, i) => {
                  const stu = groupStudents.find((s) => s._id === (f.studentId?._id || f.studentId));
                  const name = stu?.name || f.studentId?.name || '—';
                  return (
                    <tr key={f._id} style={{ background: i % 2 === 0 ? '#fff' : '#fafaf7', borderBottom: '1px solid #f0ead8' }}>
                      <td style={{ padding: '7px 10px', color: '#888', fontFamily: 'Arial' }}>{i + 1}</td>
                      <td style={{ padding: '7px 10px', fontWeight: 700, color: dark, fontFamily: 'Arial' }}>{name}</td>
                      <td style={{ padding: '7px 10px', color: '#555', fontFamily: 'Arial' }}>{f.month} {f.year}</td>
                      <td style={{ padding: '7px 10px', color: dark, fontFamily: 'Arial' }}>₹{f.amount}</td>
                      <td style={{ padding: '7px 10px', fontWeight: 700, color: '#15803d', fontFamily: 'Arial' }}>₹{f.paidAmount || f.amount}</td>
                      <td style={{ padding: '7px 10px' }}>
                        <span style={{ background: '#d1fae5', color: '#065f46', borderRadius: 4, padding: '2px 6px', fontSize: 9, fontWeight: 700, fontFamily: 'Arial', letterSpacing: 0.5 }}>PAID</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: dark }}>
                  <td colSpan={4} style={{ padding: '9px 10px', color: gold, fontFamily: 'Arial', fontWeight: 900, fontSize: 12 }}>Total Paid ({paidFees.length} records)</td>
                  <td colSpan={2} style={{ padding: '9px 10px', color: '#4DD97A', fontFamily: 'Arial', fontWeight: 900, fontSize: 15 }}>₹{totalPaid}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 12, borderTop: `1px solid ${gold}` }}>
          <div style={{ fontSize: 10, color: '#888', fontFamily: 'Arial' }}>
            <div>Thank you for your payment!</div>
            <div style={{ marginTop: 2 }}>This is a computer-generated receipt.</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img src="/signature.png" alt="Signature"
              style={{ height: 36, maxWidth: 110, objectFit: 'contain', display: 'block', margin: '0 auto 4px' }}
              onError={(e) => { e.target.style.display = 'none'; }} />
            <div style={{ width: 110, borderBottom: `1.5px solid ${dark}`, margin: '0 auto 3px' }} />
            <div style={{ fontSize: 9, color: '#888', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: 1 }}>Authorised Signatory</div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function GroupReceiptModal({ open, onClose, groupNo, groupStudents, paidFees }) {
  const receiptRef  = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing,     setSharing]     = useState(false);

  const handleWhatsApp = async () => {
    const el = receiptRef.current;
    if (!el) return;
    setSharing(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fdf8ee' });
      canvas.toBlob(async (blob) => {
        const file = new File([blob], `Group_${groupNo}_Receipt.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: `Group ${groupNo} Receipt`, text: `Fee payment receipt for Group ${groupNo}` });
        } else {
          const merged   = mergeFees(paidFees);
          const totalPaid = merged.reduce((s, f) => s + (f.paidAmount || f.amount || 0), 0);
          const mobile = (groupStudents[0]?.mobile || '').replace(/\D/g, '');
          const pad = (str, len) => String(str).substring(0, len).padEnd(len);
          const header = `${pad('#', 3)} ${pad('Student', 14)} ${pad('Cls', 5)} ${pad('Month', 10)} ${pad('Paid', 6)}`;
          const divider = '-'.repeat(header.length);
          const rows = merged.map((f, i) => {
            const name  = f.studentId?.name || '—';
            const std   = f.studentId?.std  || '—';
            const month = `${(f.month || '').slice(0, 3)} ${f.year}`;
            const paid  = `₹${f.paidAmount || f.amount}`;
            return `${pad(`${i + 1}.`, 3)} ${pad(name, 14)} ${pad(std, 5)} ${pad(month, 10)} ${paid}`;
          }).join('\n');
          const msg =
            `*Shree Ram Academy*\n` +
            `*--------------------*\n` +
            `*---- Fee Receipt ----*\n\n` +
            `\`\`\`\n${header}\n${divider}\n${rows}\n${divider}\n` +
            `${''.padEnd(3)} ${'Total'.padEnd(14)} ${''.padEnd(5)} ${''.padEnd(10)} ₹${totalPaid}\`\`\`\n\n` +
            `Records : *${merged.length}*\n` +
            `Status   : *Paid ✓*\n\n` +
            `_Thank you for your payment!_\n` +
            `-- *Shree Ram Academy*`;
          window.open(`https://wa.me/${mobile}?text=${encodeURIComponent(msg)}`, '_blank');
        }
      }, 'image/png');
    } catch (e) {
      if (e?.name !== 'AbortError') toast.error('Could not share receipt');
    }
    setSharing(false);
  };

  const handleDownload = async () => {
    const el = receiptRef.current;
    if (!el) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const canvas  = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fdf8ee' });
      const imgData = canvas.toDataURL('image/png');
      const pdf     = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`Group_${groupNo}_Receipt.pdf`);
    } catch { /* silent */ }
    setDownloading(false);
  };

  const handlePrint = () => {
    const el = receiptRef.current;
    if (!el) return;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Group Receipt</title><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f3f4f6}@media print{body{background:#fff}}</style></head><body>${el.outerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  if (!open) return null;

  return (
    <AppModal open={open} onClose={onClose} title="Fee Receipt" subtitle={`Group ${groupNo} · ${paidFees.length} paid record(s)`} width={740}>
      <div className="px-5 py-4">
        <GroupReceiptView groupNo={groupNo} groupStudents={groupStudents} paidFees={paidFees} receiptRef={receiptRef} />
      </div>
      <div className="px-5 pb-5 flex gap-2">
        <button onClick={onClose}
          className="flex-1 py-2 rounded-lg text-xs font-bold"
          style={{ background: '#f3f4f6', color: '#374151' }}>Close</button>
        <button onClick={handlePrint}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold"
          style={{ background: '#e0f2fe', color: '#0369a1', border: '1.5px solid #7dd3fc' }}>
          <PrinterOutlined /> Print
        </button>
        <button onClick={handleWhatsApp} disabled={sharing}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black"
          style={{ background: 'linear-gradient(135deg,#25D366,#1ead52)', color: '#fff' }}>
          <WhatsAppOutlined /> {sharing ? 'Sharing...' : 'WhatsApp'}
        </button>
        <button onClick={handleDownload} disabled={downloading}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black"
          style={{ background: 'linear-gradient(135deg,#C9A84C,#f0d080)', color: '#000' }}>
          <DownloadOutlined /> {downloading ? 'Downloading...' : 'Download PDF'}
        </button>
      </div>
    </AppModal>
  );
}
