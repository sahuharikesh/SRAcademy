import { useEffect, useState, useCallback, useRef } from 'react';
import { HistoryOutlined, ThunderboltOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import { getFees, getFeeSummary, payFee, sendWhatsApp, markFeeNotified, deleteFee, generateFees, getFeesByStudent, getStudents } from '../api';
import { todayISO, formatShort, formatDDMMYYYY } from '../utils/dates';
import { downloadCSV } from '../utils/csv';
import { buildFeeMsg, buildUpiQrUrl } from '../utils/messages';
import { GOLD, DARK, STD_OPTIONS } from '../utils/constants';
import FeeFilterTabs from '../components/fees/FeeFilterTabs';
import FeeTable      from '../components/fees/FeeTable';
import AppModal      from '../components/common/AppModal';
import PageSpinner   from '../components/common/PageSpinner';
import usePagination from '../hooks/usePagination';
import toast from 'react-hot-toast';

function PayModal({ fee, open, onClose, onSuccess }) {
  const alreadyPaid      = fee?.paidAmount      || 0;
  const breakdown        = fee?.pendingBreakdown || [];
  const remaining        = (fee?.amount || 0) - alreadyPaid;
  const [includePrev, setIncludePrev] = useState(false);
  const [payment,     setPayment]     = useState('');
  const [saving,      setSaving]      = useState(false);

  const prevTotal = breakdown.reduce((s, b) => s + (b.pending || 0), 0);
  const totalDue  = remaining + (includePrev ? prevTotal : 0);

  useEffect(() => {
    if (open && fee) { setIncludePrev(false); setPayment(String(remaining)); }
  }, [open, fee?._id]);

  // keep payment in sync when toggle changes
  useEffect(() => {
    setPayment(String(totalDue));
  }, [includePrev]);

  const handleConfirm = async () => {
    const amt = Number(payment);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    setSaving(true);
    try {
      // Send previous fees in ONE call so backend logs them together on current month
      const previousFees = includePrev
        ? breakdown.map(b => ({ id: b._id, month: b.month, year: b.year, amount: b.pending }))
        : [];
      await payFee(fee._id, { payment: Math.min(amt, remaining), previousFees });
      toast.success(previousFees.length > 0
        ? `Payment saved — ${previousFees.length} previous month(s) cleared`
        : `Payment of ₹${amt} saved`);
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

            {/* Current month */}
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

            {/* Previous pending — toggle section */}
            {breakdown.length > 0 && (
              <div className="rounded-xl overflow-hidden" style={{ border: '1.5px solid #fca5a5' }}>
                <button
                  onClick={() => setIncludePrev(v => !v)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold"
                  style={{ background: includePrev ? '#fee2e2' : '#fff5f5', color: '#dc2626' }}>
                  <span>Previous Pending  ₹{prevTotal}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-black"
                    style={{ background: includePrev ? '#dc2626' : '#fca5a5', color: '#fff' }}>
                    {includePrev ? '✓ Included' : '+ Include'}
                  </span>
                </button>
                {includePrev && (
                  <div className="px-3 pb-2 pt-1 flex flex-col gap-1" style={{ background: '#fff5f5' }}>
                    {breakdown.map((b, i) => (
                      <div key={i} className="flex justify-between text-[11px]" style={{ color: '#b91c1c' }}>
                        <span>{b.month} {b.year} <span className="opacity-60">({b.status})</span></span>
                        <span className="font-bold">₹{b.pending}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between text-sm border-t pt-2">
              <span className="font-black">Total Due</span>
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

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function PaymentHistoryModal({ open, onClose }) {
  const [step,      setStep]      = useState(1); // 1=std, 2=students, 3=history
  const [selStd,    setSelStd]    = useState('');
  const [students,  setStudents]  = useState([]);
  const [loadingS,  setLoadingS]  = useState(false);
  const [selStu,    setSelStu]    = useState(null);
  const [history,   setHistory]   = useState([]);
  const [loadingH,  setLoadingH]  = useState(false);
  const [stuSearch, setStuSearch] = useState('');

  useEffect(() => {
    if (!open) { setStep(1); setSelStd(''); setStudents([]); setSelStu(null); setHistory([]); setStuSearch(''); }
  }, [open]);

  const handleStdSelect = async (std) => {
    setSelStd(std); setLoadingS(true); setStudents([]); setStuSearch('');
    try {
      const res = await getStudents({ std, limit: 200 });
      setStudents(res.data || []);
      setStep(2);
    } catch { toast.error('Failed to load students'); }
    finally { setLoadingS(false); }
  };

  const handleStudentSelect = async (stu) => {
    setSelStu(stu); setLoadingH(true); setHistory([]);
    try {
      const data = await getFeesByStudent(stu._id);
      setHistory(data || []);
      setStep(3);
    } catch { toast.error('Failed to load history'); }
    finally { setLoadingH(false); }
  };

  const gold = '#C9A84C';
  const dueHistory   = history.filter(f => f.status !== 'Upcoming');
  const totalPaid    = dueHistory.reduce((s, f) => s + (f.paidAmount || 0), 0);
  const totalPending = dueHistory.reduce((s, f) => s + Math.max(0, (f.amount || 0) - (f.paidAmount || 0)), 0);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(stuSearch.toLowerCase()) ||
    (s.mobile || '').includes(stuSearch)
  );

  return (
    <AppModal open={open} onClose={onClose} title="Payment History" width={520}
      subtitle={step === 3 && selStu ? `${selStu.name} — ${selStu.std}` : step === 2 ? `Class ${selStd}` : 'Select class to begin'}>

      <div className="px-5 py-4" style={{ minHeight: 320 }}>

        {/* Step 1 — Select Std */}
        {step === 1 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#888' }}>Select Class</p>
            <div className="grid grid-cols-3 gap-2">
              {STD_OPTIONS.map(std => (
                <button key={std} onClick={() => handleStdSelect(std)}
                  className="py-2 rounded-xl text-xs font-black transition-all"
                  style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb', color: '#1a1a1a' }}
                  onMouseEnter={e => { e.currentTarget.style.background='#fffdf5'; e.currentTarget.style.borderColor=gold; }}
                  onMouseLeave={e => { e.currentTarget.style.background='#f9fafb'; e.currentTarget.style.borderColor='#e5e7eb'; }}>
                  {std}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Select Student */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} className="text-xs font-bold mb-3 flex items-center gap-1" style={{ color: gold }}>
              ← Back to Classes
            </button>
            <input
              autoFocus
              type="text"
              placeholder="Search student…"
              value={stuSearch}
              onChange={e => setStuSearch(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg text-xs outline-none mb-3"
              style={{ border: '1.5px solid #C9A84C', background: '#fffdf5' }}
            />
            {loadingS ? (
              <p className="text-xs text-gray-400 text-center py-8">Loading students…</p>
            ) : filteredStudents.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">
                {stuSearch ? `No match for "${stuSearch}"` : `No students in ${selStd}`}
              </p>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                {filteredStudents.map(stu => (
                  <button key={stu._id} onClick={() => handleStudentSelect(stu)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                    style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb' }}
                    onMouseEnter={e => { e.currentTarget.style.background='#fffdf5'; e.currentTarget.style.borderColor=gold; }}
                    onMouseLeave={e => { e.currentTarget.style.background='#f9fafb'; e.currentTarget.style.borderColor='#e5e7eb'; }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{ background: '#1a1a1a', color: gold }}>
                      {stu.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold" style={{ color: '#1a1a1a' }}>{stu.name}</div>
                      {stu.mobile && <div className="text-[10px]" style={{ color: '#888' }}>{stu.mobile}</div>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3 — History */}
        {step === 3 && (
          <div>
            <button onClick={() => setStep(2)} className="text-xs font-bold mb-3 flex items-center gap-1" style={{ color: gold }}>
              ← Back to Students
            </button>

            {loadingH ? <p className="text-xs text-gray-400 text-center py-8">Loading history…</p> : history.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No payment records found</p>
            ) : (
              <>
                {/* Summary */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="rounded-lg px-2.5 py-1.5" style={{ background: '#d1fae5', border: '1.5px solid #6ee7b7' }}>
                    <div className="text-[9px] font-bold uppercase tracking-wide" style={{ color: '#065f46' }}>Total Paid</div>
                    <div className="text-sm font-black" style={{ color: '#065f46' }}>₹{totalPaid.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="rounded-lg px-2.5 py-1.5" style={{ background: '#fee2e2', border: '1.5px solid #fca5a5' }}>
                    <div className="text-[9px] font-bold uppercase tracking-wide" style={{ color: '#dc2626' }}>Total Pending</div>
                    <div className="text-sm font-black" style={{ color: '#dc2626' }}>₹{totalPending.toLocaleString('en-IN')}</div>
                  </div>
                </div>
                {/* Monthly fee note if all months have same fee */}
                {(() => {
                  const amounts = dueHistory.map(f => f.amount);
                  const allSame = amounts.length > 0 && amounts.every(a => a === amounts[0]);
                  return allSame ? (
                    <p className="text-[10px] font-bold mb-2" style={{ color: '#9ca3af' }}>
                      Monthly Fee: <span style={{ color: '#374151' }}>₹{amounts[0]}</span> (same for all months)
                    </p>
                  ) : null;
                })()}

                {/* Records */}
                {(() => {
                  const relevant  = dueHistory;
                  const feeAmounts = relevant.map(f => f.amount);
                  const allSameFee = feeAmounts.length > 0 && feeAmounts.every(a => a === feeAmounts[0]);
                  return (
                  <div className="flex flex-col gap-2 overflow-y-auto pr-1" style={{ maxHeight: 300 }}>
                  {relevant.map(f => {
                    const paid      = f.paidAmount || 0;
                    const remaining = Math.max(0, f.amount - paid);
                    const rawStatus = f.status || (paid >= f.amount ? 'Paid' : paid > 0 ? 'Partial' : 'Pending');
                    const status    = rawStatus === 'Pending' ? 'No Due' : rawStatus;
                    const color     = status === 'Paid' ? '#065f46' : status === 'Partial' ? '#b45309' : '#dc2626';
                    const bg        = status === 'Paid' ? '#d1fae5' : status === 'Partial' ? '#fef9c3' : '#fee2e2';
                    const logs      = (f.paymentLogs || []).filter(l => l.amount > 0);
                    const displayLogs = logs.length > 0
                      ? logs
                      : paid > 0 && f.paidDate
                        ? [{ amount: paid, date: f.paidDate }]
                        : [];
                    return (
                      <div key={f._id} className="rounded-xl overflow-hidden"
                        style={{ border: '1.5px solid #e5e7eb' }}>

                        {/* 3-equal-column header row */}
                        <div className="grid px-3 py-2" style={{ gridTemplateColumns: '1fr 1fr 1fr', background: '#f9fafb', borderBottom: displayLogs.length > 0 ? '1px dashed #e5e7eb' : 'none' }}>
                          <span className="text-xs font-bold" style={{ color: '#1a1a1a' }}>{f.month} {f.year}</span>
                          <span className="text-[10px] font-bold text-center" style={{ color: '#059669' }}>Pd ₹{paid}</span>
                          <span className="text-[10px] font-bold text-right" style={{ color: remaining > 0 ? '#dc2626' : '#9ca3af' }}>Rem ₹{remaining}</span>
                        </div>

                        {/* Payment log entries */}
                        {displayLogs.length > 0 && (
                          <div className="px-3 py-2 flex flex-col gap-2" style={{ background: '#fffdf5' }}>
                            {displayLogs.map((log, i) => {
                              const prev = log.clearedPrevious || [];
                              const total = log.totalCollected || log.amount;
                              const dateStr = formatShort(log.date);
                              return (
                                <div key={i}>
                                  {/* Main row: date + total collected */}
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px]" style={{ color: '#6b7280' }}>{dateStr}</span>
                                    <span className="text-[11px] font-black" style={{ color: '#059669' }}>
                                      + ₹{total}
                                    </span>
                                  </div>
                                  {/* Breakdown if previous fees were cleared */}
                                  {prev.length > 0 && (
                                    <div className="ml-2 mt-0.5 flex flex-col gap-0.5">
                                      <div className="flex justify-between text-[9px]" style={{ color: '#6b7280' }}>
                                        <span>↳ This month</span>
                                        <span>₹{log.amount}</span>
                                      </div>
                                      {prev.map((p, j) => (
                                        <div key={j} className="flex justify-between text-[9px]" style={{ color: '#b45309' }}>
                                          <span>↳ {p.month} {p.year} (prev. balance)</span>
                                          <span>₹{p.amount}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                  );
                })()}
              </>
            )}
          </div>
        )}
      </div>

    </AppModal>
  );
}

export default function Fees() {
  const [fees,         setFees]         = useState([]);
  const [summary,      setSummary]      = useState(null);
  const [filter,       setFilter]       = useState('All');
  const [filterMonth,  setFilterMonth]  = useState('');
  const [filterStd,    setFilterStd]    = useState('');
  const { page, setPage, setTotal, reset: resetPage, paginationProps } = usePagination(15);
  const [waModal,      setWaModal]      = useState(null);
  const [payModal,     setPayModal]     = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [histModal,    setHistModal]    = useState(false);
  const [selected,     setSelected]     = useState(new Set());
  const autoGenDone = useRef(false);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const [res, s] = await Promise.all([
        getFees({ page: p, limit: 15, status: filter, month: filterMonth, std: filterStd }),
        getFeeSummary(filterMonth).catch(() => null),
      ]);
      setFees(res.data);
      setTotal(res.total);
      if (s) setSummary(s);
      return res.total;
    } catch { toast.error('Failed to load fees'); return 0; }
    finally { setLoading(false); }
  }, [filter, filterMonth, filterStd]);

  useEffect(() => {
    autoGenDone.current = false;
  }, []);

  useEffect(() => {
    resetPage();
    setSelected(new Set());
    (async () => {
      const total = await load(1);
      // Auto-generate fees when page loads with 0 records (e.g. after deleting all)
      if (total === 0 && !autoGenDone.current) {
        autoGenDone.current = true;
        try {
          const res = await generateFees({});
          if (res.message && res.message !== 'No Future Data Available') {
            toast.success(`Auto-generated: ${res.message}`);
            await load(1);
          }
        } catch { /* silent — manual generate button still available */ }
      }
    })();
  }, [filter, filterMonth, filterStd]);

  useEffect(() => { if (page > 1) load(page); }, [page]);

  const handlePay = (fee) => setPayModal(fee);

  const reload = useCallback(() => {
    setFilter('All');
    setFilterMonth('');
    setFilterStd('');
    resetPage();
    load(1);
  }, [load]);

  const handleGenerate = () => {
    setConfirmModal({
      message: 'Generate fees for students whose due date is within next 30 days?',
      onConfirm: async () => {
        try { const res = await generateFees({}); toast.success(res.message); reload(); }
        catch { toast.error('Failed to generate fees'); }
      },
    });
  };

  const handleDelete = (fee) => {
    setConfirmModal({
      message: `Delete fee record for ${fee.studentId?.name} — ${fee.month} ${fee.year}?`,
      onConfirm: async () => {
        try { await deleteFee(fee._id); toast.success('Fee deleted'); load(1); }
        catch { toast.error('Failed to delete'); }
      },
    });
  };

  const handleBulkDelete = async (ids) => {
    try {
      await Promise.all(ids.map((id) => deleteFee(id)));
      toast.success(`${ids.length} fee record(s) deleted`);
      load(1);
    } catch { toast.error('Failed to delete some records'); }
  };

  const handleDownloadCSV = async () => {
    try {
      const res = await getFees({ page: 1, limit: 10000, status: filter, month: filterMonth, std: filterStd });
      const rows = res.data;
      if (!rows.length) { toast.error('No records to export'); return; }
      downloadCSV(
        ['Student', 'Mobile', 'Class', 'Month', 'Year', 'Amount', 'Paid', 'Pending', 'Status', 'Due Date'],
        rows.map(f => {
          const paid    = f.paidAmount || 0;
          const pending = Math.max(0, (f.amount || 0) - paid);
          return [f.studentId?.name || '', f.studentId?.mobile || '', f.studentId?.std || '',
            f.month, f.year, f.amount, paid, pending, f.status, formatDDMMYYYY(f.dueDate)];
        }),
        `fees_${filterMonth || 'all'}_${todayISO()}.csv`,
      );
      toast.success(`Exported ${rows.length} records`);
    } catch { toast.error('Export failed'); }
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

  if (loading) return <PageSpinner />;

  return (
    <div className="anim-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg font-black" style={{ color: '#1a1a1a' }}>Fees Management</h1>
          <p className="text-xs mt-0.5 font-medium" style={{ color: '#888' }}>Track, collect & manage student payments</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleDownloadCSV}
            className="px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5"
            style={{ background: '#f0fdf4', border: '1.5px solid #86efac', color: '#15803d' }}>
            <DownloadOutlined /> CSV
          </button>
          <button onClick={handleGenerate}
            className="btn-shine px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5" style={DARK}>
            <ThunderboltOutlined /> Generate Fees
          </button>
          <button onClick={() => setHistModal(true)}
            className="px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5" style={{ background:'#fffdf5', border:'1.5px solid #C9A84C', color:'#7a6020' }}>
            <HistoryOutlined /> Payment History
          </button>
        </div>
      </div>

      {/* Monthly Revenue Summary */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Monthly Collection',   value: summary.totalDue,             color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe', sub: `${summary.month} ${summary.year} — total due`     },
            { label: 'Upcoming & Overdue',   value: summary.totalUpcomingOverdue, color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', sub: 'Overdue + partial remaining + upcoming (7 days)'   },
            { label: 'Paid',                 value: summary.totalPaid,            color: '#065f46', bg: '#d1fae5', border: '#6ee7b7', sub: 'Total collected (all months)'       },
            { label: 'Still Pending',        value: summary.totalStillPending,    color: '#dc2626', bg: '#fee2e2', border: '#fca5a5', sub: 'Overdue + partial dues'   },
          ].map(({ label, value, color, bg, border, sub }) => (
            <div key={label} className="rounded-xl px-4 py-3" style={{ background: bg, border: `1.5px solid ${border}` }}>
              <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color }}>{label}</div>
              <div className="text-2xl font-black" style={{ color }}>₹{Math.max(0, value).toLocaleString('en-IN')}</div>
              <div className="text-[10px] mt-0.5" style={{ color, opacity: 0.7 }}>{sub}</div>
            </div>
          ))}
        </div>
      )}

      <FeeFilterTabs fees={fees} active={filter} onChange={setFilter} />

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
          className="rounded-md px-2 text-xs focus:outline-none"
          style={{ border: '1px solid #C9A84C', background: '#fff', height: 25 }}>
          <option value="">All Months</option>
          {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterStd} onChange={(e) => setFilterStd(e.target.value)}
          className="rounded-md px-2 text-xs focus:outline-none"
          style={{ border: '1px solid #C9A84C', background: '#fff', height: 25 }}>
          <option value="">All Classes</option>
          {STD_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {(filterMonth || filterStd || selected.size > 0) && (
          <button onClick={() => { setFilterMonth(''); setFilterStd(''); setSelected(new Set()); }}
            className="px-3 rounded-md text-xs font-bold"
            style={{ border: '1px solid #C9A84C', color: '#7a6020', background: '#f5f0e8', height: 25 }}>
            Clear
          </button>
        )}
        {selected.size > 0 && (
          <>
            <button onClick={() => Modal.confirm({
                title: `Delete ${selected.size} fee record(s)?`,
                content: 'This will permanently remove the selected fee records.',
                okText: 'Delete', okType: 'danger', cancelText: 'Cancel', centered: true,
                onOk: async () => { await handleBulkDelete([...selected]); setSelected(new Set()); },
              })}
              className="flex items-center gap-1 px-3 rounded-lg text-xs font-bold"
              style={{ background: '#fee2e2', color: '#dc2626', height: 25 }}>
              <DeleteOutlined /> Delete Selected
            </button>
            <span className="text-xs font-bold px-2.5 rounded-full flex items-center"
              style={{ background: '#1a1a1a', color: '#C9A84C', height: 25 }}>
              {selected.size} selected
            </span>
          </>
        )}
      </div>

      <FeeTable
        fees={fees}
        onPay={handlePay}
        onWhatsApp={handleWhatsApp}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onCommentSaved={(id, comments) =>
          setFees((prev) => prev.map((f) => f._id === id ? { ...f, comments } : f))
        }
        paginationProps={paginationProps}
        selected={selected}
        setSelected={setSelected}
      />

      <PayModal fee={payModal} open={!!payModal} onClose={() => setPayModal(null)} onSuccess={() => load(1)} />
      <PaymentHistoryModal open={histModal} onClose={() => setHistModal(false)} />

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
