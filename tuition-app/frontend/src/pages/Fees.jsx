import { useEffect, useState } from 'react';
import { getFees, payFee, sendWhatsApp, markFeeNotified, getStudents, addFee, deleteFee, generateFees } from '../api';
import { buildFeeMsg, buildUpiQrUrl } from '../utils/messages';
import { GOLD, DARK } from '../utils/constants';
import AddFeeForm    from '../components/fees/AddFeeForm';
import FeeFilterTabs from '../components/fees/FeeFilterTabs';
import FeeTable      from '../components/fees/FeeTable';
import AppModal      from '../components/common/AppModal';
import toast from 'react-hot-toast';

function PayModal({ fee, open, onClose, onSuccess }) {
  const alreadyPaid = fee?.paidAmount  || 0;
  const lastPending = fee?.lastPending || 0;
  const remaining   = (fee?.amount || 0) - alreadyPaid;
  const totalDue    = remaining + lastPending;
  const [payment, setPayment] = useState('');
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    if (open && fee) setPayment(String(totalDue));
  }, [open, fee?._id]);

  const handleConfirm = async () => {
    const amt = Number(payment);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    setSaving(true);
    try {
      await payFee(fee._id, { payment: amt });
      const newTotal = alreadyPaid + amt;
      toast.success(newTotal >= fee.amount ? 'Fee fully paid!' : `Partial payment of ₹${amt} saved`);
      onSuccess();
      onClose();
    } catch { toast.error('Something went wrong'); }
    finally { setSaving(false); }
  };

  return (
    <AppModal open={open} onClose={onClose} title="Record Payment"
      subtitle={fee ? `${fee.studentId?.name} — ${fee.month} ${fee.year}` : ''}
      destroyOnClose>
      {fee && (
        <>
          <div className="px-5 py-4 flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">This Month Fee</span>
              <span className="font-bold">₹{fee.amount}</span>
            </div>
            {alreadyPaid > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Already Paid</span>
                <span className="font-semibold" style={{ color: '#b45309' }}>₹{alreadyPaid}</span>
              </div>
            )}
            {lastPending > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Previous Pending</span>
                <span className="font-semibold" style={{ color: '#dc2626' }}>₹{lastPending}</span>
              </div>
            )}
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="font-black">Total Fees</span>
              <span className="font-black" style={{ color: '#dc2626' }}>₹{totalDue}</span>
            </div>
            <div className="mt-1">
              <label className="text-xs font-bold uppercase tracking-wide mb-1 block" style={{ color: '#6b7280' }}>
                Amount Received Now
              </label>
              <input type="number" min="1" value={payment} autoFocus
                onChange={(e) => setPayment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ border: '1.5px solid #C9A84C', background: '#fffdf5' }} />
              {Number(payment) > 0 && Number(payment) < remaining && (
                <p className="text-xs mt-1" style={{ color: '#b45309' }}>
                  Still ₹{remaining - Number(payment)} pending — will be marked Partial
                </p>
              )}
              {Number(payment) >= remaining && remaining > 0 && (
                <p className="text-xs mt-1" style={{ color: '#155724' }}>This month fully paid</p>
              )}
            </div>
          </div>
          <div className="px-5 pb-5 flex gap-2">
            <button onClick={onClose} className="flex-1 py-1.5 rounded-lg text-xs font-black"
              style={{ background: '#e5e7eb', color: '#374151' }}>Cancel</button>
            <button onClick={handleConfirm} disabled={saving}
              className="flex-1 py-1.5 rounded-lg text-xs font-black" style={GOLD}>
              {saving ? 'Saving…' : 'Confirm'}
            </button>
          </div>
        </>
      )}
    </AppModal>
  );
}

function ConfirmModal({ open, message, onConfirm, onClose }) {
  return (
    <AppModal open={open} onClose={onClose} title="Confirm Action">
      <div className="px-5 py-5 text-sm text-center" style={{ color: '#1a1a1a' }}>{message}</div>
      <div className="px-5 pb-5 flex gap-2">
        <button onClick={onClose} className="flex-1 py-1.5 rounded-lg text-xs font-black"
          style={{ background: '#e5e7eb', color: '#374151' }}>Cancel</button>
        <button onClick={() => { onConfirm(); onClose(); }}
          className="flex-1 py-1.5 rounded-lg text-xs font-black"
          style={{ background: '#fee2e2', color: '#dc2626' }}>Confirm</button>
      </div>
    </AppModal>
  );
}

export default function Fees() {
  const [fees,         setFees]         = useState([]);
  const [students,     setStudents]     = useState([]);
  const [filter,       setFilter]       = useState('All');
  const [filterMonth,  setFilterMonth]  = useState('');
  const [filterYear,   setFilterYear]   = useState('');
  const [showAddFee,   setShowAddFee]   = useState(false);
  const [waModal,      setWaModal]      = useState(null);
  const [payModal,     setPayModal]     = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const load = () => getFees().then(setFees).catch(() => toast.error('Failed to load fees'));
  useEffect(() => { load(); getStudents().then(setStudents).catch(() => {}); }, []);

  const handlePay = (fee) => setPayModal(fee);

  const handleAddFee = async (formData, resetForm) => {
    try {
      await addFee(formData); toast.success('Fee record added!');
      setShowAddFee(false); resetForm(); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Something went wrong'); }
  };

  const handleGenerate = () => {
    setConfirmModal({
      message: 'Generate fees for students whose due date is within next 7 days?',
      onConfirm: async () => {
        try { const res = await generateFees({}); toast.success(res.message); load(); }
        catch { toast.error('Failed to generate fees'); }
      },
    });
  };

  const handleDelete = (fee) => {
    setConfirmModal({
      message: `Delete fee record for ${fee.studentId?.name} — ${fee.month} ${fee.year}?`,
      onConfirm: async () => {
        try { await deleteFee(fee._id); toast.success('Fee deleted'); load(); }
        catch { toast.error('Failed to delete'); }
      },
    });
  };

  const handleBulkDelete = async (ids) => {
    try {
      await Promise.all(ids.map((id) => deleteFee(id)));
      toast.success(`${ids.length} fee record(s) deleted`);
      load();
    } catch { toast.error('Failed to delete some records'); }
  };

  const handleWhatsApp = (fee) => {
    setWaModal({ fee, msg: buildFeeMsg(fee), qrUrl: buildUpiQrUrl(fee), amount: fee.amount });
  };

  const handleSendFromModal = () => {
    if (!waModal) return;
    sendWhatsApp(waModal.fee.studentId?.mobile, waModal.msg);
    markFeeNotified(waModal.fee._id).catch(() => {});
    setFees((prev) => prev.map((f) => f._id === waModal.fee._id ? { ...f, notificationSent: true } : f));
    setWaModal(null);
    toast.success('WhatsApp opened!');
  };

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const years  = [...new Set(fees.map((f) => f.year))].sort((a, b) => b - a);

  const filtered = fees.filter((f) => {
    if (filter !== 'All' && f.status !== filter) return false;
    if (filterMonth && f.month !== filterMonth) return false;
    if (filterYear  && f.year  !== Number(filterYear)) return false;
    return true;
  });

  return (
    <div className="anim-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#1a1a1a' }}>Fees Management</h1>
          <p className="text-xs mt-0.5 font-medium" style={{ color: '#888' }}>Track, collect & manage student payments</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowAddFee((v) => !v)}
            className="btn-shine px-3 py-1 rounded-lg text-xs font-bold" style={GOLD}>
            + Add Fee
          </button>
          <button onClick={handleGenerate}
            className="btn-shine px-3 py-1 rounded-lg text-xs font-bold" style={DARK}>
            Generate Monthly Fees
          </button>
        </div>
      </div>

      {showAddFee && (
        <AddFeeForm students={students} onSubmit={handleAddFee} onCancel={() => setShowAddFee(false)} />
      )}

      <FeeFilterTabs fees={fees} active={filter} onChange={setFilter} />

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
          className="rounded-md px-2 py-1.5 text-xs focus:outline-none"
          style={{ border: '1px solid #C9A84C', background: '#fff' }}>
          <option value="">All Months</option>
          {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
          className="rounded-md px-2 py-1.5 text-xs focus:outline-none"
          style={{ border: '1px solid #C9A84C', background: '#fff' }}>
          <option value="">All Years</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        {(filterMonth || filterYear) && (
          <button onClick={() => { setFilterMonth(''); setFilterYear(''); }}
            className="text-xs px-2 py-1.5 rounded-md"
            style={{ border: '1px solid #C9A84C', color: '#7a6020', background: '#f5f0e8' }}>
            Clear
          </button>
        )}
      </div>

      <FeeTable
        fees={filtered}
        onPay={handlePay}
        onWhatsApp={handleWhatsApp}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onCommentSaved={(id, comments) =>
          setFees((prev) => prev.map((f) => f._id === id ? { ...f, comments } : f))
        }
      />

      <PayModal fee={payModal} open={!!payModal} onClose={() => setPayModal(null)} onSuccess={load} />

      <ConfirmModal
        open={!!confirmModal}
        message={confirmModal?.message}
        onConfirm={confirmModal?.onConfirm || (() => {})}
        onClose={() => setConfirmModal(null)}
      />

      <AppModal open={!!waModal} onClose={() => setWaModal(null)} title="Send Fee Reminder"
        subtitle={waModal ? `${waModal.fee.studentId?.name} — ${waModal.fee.month} ${waModal.fee.year}` : ''}>
        {waModal && (
          <>
            <div className="px-5 py-4 flex flex-col gap-4">
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide self-start">UPI Payment QR — Scan to Pay</p>
                <img src={waModal.qrUrl} alt="UPI QR" className="w-48 h-48 rounded-xl self-center"
                  style={{ border: '2px solid #C9A84C' }} />
                <div className="text-center">
                  <div className="text-base font-black" style={{ color: '#1a1a1a' }}>₹{waModal.amount}</div>
                  <div className="text-xs font-semibold" style={{ color: '#C9A84C' }}>{waModal.fee.studentId?.name}</div>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Message Preview</p>
                <div className="rounded-xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap"
                  style={{ background: '#DCF8C6', color: '#1a1a1a', border: '1px solid #b7e4a0', maxHeight: '160px', overflowY: 'auto', fontFamily: 'inherit' }}>
                  {waModal.msg}
                </div>
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-3">
              <button onClick={() => setWaModal(null)} className="flex-1 py-2.5 rounded-lg text-sm font-bold"
                style={{ background: '#f3f4f6', color: '#666' }}>Cancel</button>
              <button onClick={handleSendFromModal}
                className="flex-1 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#25D366,#1ead52)', color: '#fff' }}>
                Send WhatsApp
              </button>
            </div>
          </>
        )}
      </AppModal>
    </div>
  );
}
