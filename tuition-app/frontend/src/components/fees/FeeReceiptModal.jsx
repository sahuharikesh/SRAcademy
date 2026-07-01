import { useRef, useState } from 'react';
import AppModal from '../common/AppModal';
import { DownloadOutlined, PrinterOutlined, WhatsAppOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';

function ReceiptView({ fee, receiptRef }) {
  const gold  = '#C9A84C';
  const dark  = '#1a1a1a';
  const cream = '#fdf8ee';

  const student   = fee.studentId || {};
  const paidDate  = fee.paidDate ? new Date(fee.paidDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
  const receiptNo = fee._id?.slice(-8).toUpperCase();

  return (
    <div ref={receiptRef} style={{
      width: '100%', maxWidth: 640, margin: '0 auto',
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
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ fontSize: 40, fontWeight: 900, color: gold, opacity: 0.04, whiteSpace: 'nowrap', letterSpacing: 8, fontFamily: 'Arial, sans-serif', lineHeight: 2, transform: 'rotate(-15deg)', userSelect: 'none' }}>
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
        <div style={{ textAlign: 'center', marginBottom: 18, borderBottom: `2px solid ${gold}`, paddingBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 4 }}>
            <img src="/logo.png" alt="logo" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${gold}` }}
              onError={(e) => { e.target.style.display = 'none'; }} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: dark, letterSpacing: 1 }}>Shree Ram Academy</div>
              <div style={{ fontSize: 10, color: '#888', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Arial' }}>Fee Payment Receipt</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: '#666', fontFamily: 'Arial' }}>
            <span>Receipt No: <strong style={{ color: dark }}>#{receiptNo}</strong></span>
            <span>Date: <strong style={{ color: dark }}>{paidDate}</strong></span>
          </div>
        </div>

        {/* Green PAID stamp */}
        <div style={{ position: 'absolute', top: 36, right: 44, transform: 'rotate(12deg)', border: '3px solid #15803d', borderRadius: 4, padding: '2px 10px', zIndex: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: '#15803d', letterSpacing: 3, fontFamily: 'Arial' }}>PAID</span>
        </div>

        {/* Student info */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'Arial', marginBottom: 6 }}>Student Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: 13 }}>
            {[
              ['Name', student.name || '—'],
              ['Class', student.std ? `Class ${student.std}` : '—'],
              ['Mobile', student.mobile || '—'],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e5e7eb', paddingBottom: 4 }}>
                <span style={{ color: '#666', fontFamily: 'Arial', fontSize: 11 }}>{label}</span>
                <span style={{ fontWeight: 700, color: dark }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fee details */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'Arial', marginBottom: 6 }}>Payment Details</div>
          <div style={{ background: '#fff', border: `1.5px solid ${gold}`, borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: dark }}>
                  {['Description', 'Month', 'Amount'].map((h) => (
                    <th key={h} style={{ padding: '8px 12px', color: gold, fontFamily: 'Arial', fontSize: 11, textAlign: 'left', fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 12px', fontFamily: 'Arial', color: dark }}>Tuition Fees</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'Arial', color: '#555' }}>{fee.month} {fee.year}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'Arial', fontWeight: 700, color: dark }}>₹{fee.paidAmount || fee.amount}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr style={{ background: '#1a1a1a' }}>
                  <td colSpan={2} style={{ padding: '10px 12px', color: gold, fontFamily: 'Arial', fontWeight: 900, fontSize: 13 }}>Total Paid</td>
                  <td style={{ padding: '10px 12px', color: '#4DD97A', fontFamily: 'Arial', fontWeight: 900, fontSize: 15 }}>₹{fee.paidAmount || fee.amount}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16, paddingTop: 12, borderTop: `1px solid ${gold}` }}>
          <div style={{ fontSize: 10, color: '#888', fontFamily: 'Arial' }}>
            <div>Thank you for your payment!</div>
            <div style={{ marginTop: 2 }}>This is a computer-generated receipt.</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img src="/signature.png" alt="Signature"
              style={{ height: 38, maxWidth: 120, objectFit: 'contain', display: 'block', margin: '0 auto 4px' }}
              onError={(e) => { e.target.style.display = 'none'; }} />
            <div style={{ width: 110, borderBottom: `1.5px solid ${dark}`, margin: '0 auto 3px' }} />
            <div style={{ fontSize: 9, color: '#888', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: 1 }}>Authorised Signatory</div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function FeeReceiptModal({ open, onClose, fee }) {
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
        const student = fee?.studentId;
        const file = new File([blob], `Receipt_${student?.name || 'Student'}_${fee?.month}_${fee?.year}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Fee Receipt', text: `Fee receipt for ${student?.name} — ${fee?.month} ${fee?.year}` });
        } else {
          const mobile = (student?.mobile || '').replace(/\D/g, '');
          const msg = `*Shree Ram Academy*\n*Fee Payment Receipt*\n\nDear Parent of *${student?.name}*,\n\nPayment received for *${fee?.month} ${fee?.year}*.\nAmount Paid: *₹${fee?.paidAmount || fee?.amount}*\nStatus: *Paid ✓*\n\n_Thank you for your payment!_\n-- Shree Ram Academy`;
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
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fdf8ee' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      const name = fee?.studentId?.name?.replace(/\s+/g, '_') || 'Student';
      pdf.save(`Receipt_${name}_${fee?.month}_${fee?.year}.pdf`);
    } catch { /* silent */ }
    setDownloading(false);
  };

  const handlePrint = () => {
    const el = receiptRef.current;
    if (!el) return;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Fee Receipt</title><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f3f4f6}@media print{body{background:#fff}}</style></head><body>${el.outerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  if (!fee) return null;

  return (
    <AppModal open={open} onClose={onClose} title="Fee Receipt" subtitle={`${fee.studentId?.name} — ${fee.month} ${fee.year}`} width={700}>
      <div className="px-5 py-4">
        <ReceiptView fee={fee} receiptRef={receiptRef} />
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
