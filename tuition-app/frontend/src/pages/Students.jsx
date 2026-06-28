import { useEffect, useState, useCallback } from 'react';
import { getStudents, addStudent, updateStudent, deleteStudent, getGroups, getFees } from '../api';
import StudentForm, { EMPTY }   from '../components/students/StudentForm';
import StudentTable              from '../components/students/StudentTable';
import WaGroupModal              from '../components/students/WaGroupModal';
import CertificateModal          from '../components/students/CertificateModal';
import AppModal                  from '../components/common/AppModal';
import { STD_OPTIONS, MEDIUM_OPTIONS } from '../utils/constants';
import { WhatsAppOutlined, HistoryOutlined } from '@ant-design/icons';
import usePagination from '../hooks/usePagination';
import toast from 'react-hot-toast';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [groups,   setGroups]   = useState([]);
  const [form,     setForm]     = useState(EMPTY);
  const [editId,   setEditId]   = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search,        setSearch]        = useState('');
  const [filterStd,     setFilterStd]     = useState('');
  const [filterGroup,   setFilterGroup]   = useState('');
  const [filterMedium,  setFilterMedium]  = useState('');
  const { page, setPage, setTotal, reset: resetPage, paginationProps } = usePagination(15);
  const [showWaGroup,    setShowWaGroup]    = useState(false);
  const [certStudent,    setCertStudent]    = useState(null);
  const [submitting,     setSubmitting]     = useState(false);
  const [loading,        setLoading]        = useState(true);
  const [historyOpen,    setHistoryOpen]    = useState(false);
  const [allFees,        setAllFees]        = useState([]);
  const [allStudentsAll, setAllStudentsAll] = useState([]);
  const [historyStudent, setHistoryStudent] = useState('');
  const [logPopup,       setLogPopup]       = useState(null); // { fee, studentName }

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const [res, g] = await Promise.all([
        getStudents({ page: p, limit: 15, search, std: filterStd, group: filterGroup, medium: filterMedium }),
        getGroups().catch(() => []),
      ]);
      setStudents(res.data);
      setTotal(res.total);
      setGroups(g);
    } catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  }, [search, filterStd, filterGroup, filterMedium]);

  useEffect(() => { resetPage(); load(1); }, [search, filterStd, filterGroup, filterMedium]);
  useEffect(() => { if (page > 1) load(page); }, [page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      if (editId) { await updateStudent(editId, form); toast.success('Student updated!'); }
      else        { await addStudent(form);             toast.success('Student admitted!'); }
      setForm(EMPTY); setEditId(null); setShowForm(false); load(page);
    } catch (err) { toast.error(err.response?.data?.error || 'Something went wrong'); }
    finally { setSubmitting(false); }
  };

  const handleEdit = (s) => {
    setForm({
      name: s.name, mobile: s.mobile, std: s.std,
      dateOfAdmission: s.dateOfAdmission?.split('T')[0] || '',
      feeType: s.feeType, actualFees: s.actualFees,
      recommendedFees: s.recommendedFees, groupNo: s.groupNo || '',
      medium: Array.isArray(s.medium) ? (s.medium[0] || '') : (s.medium || ''),
      schoolName: s.schoolName || '', comment: s.comment || '',
    });
    setEditId(s._id); setShowForm(true); window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this student?')) return;
    await deleteStudent(id); toast.success('Student removed'); load(page);
  };

  const handleBulkDelete = async (ids) => {
    try {
      await Promise.all(ids.map((id) => deleteStudent(id)));
      toast.success(`${ids.length} student(s) deleted`);
      load(page);
    } catch { toast.error('Failed to delete some students'); }
  };

  const handleCancel = () => { setShowForm(false); setForm(EMPTY); setEditId(null); };

  return (
    <div className="anim-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#1a1a1a' }}>Students</h1>
          <p className="text-xs mt-0.5 font-medium" style={{ color: '#888' }}>Manage admissions & student records</p>
        </div>
        <div className="flex gap-2">
          <button onClick={async () => {
              setHistoryOpen(true);
              if (allFees.length === 0) {
                try {
                  const [fRes, sRes] = await Promise.all([getFees({ limit: 1000 }), getStudents({ limit: 1000 })]);
                  setAllFees(fRes.data || []);
                  setAllStudentsAll(sRes.data || []);
                } catch {}
              }
            }}
            className="btn-shine px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5"
            style={{ background: '#eff6ff', color: '#1d4ed8', border: '1.5px solid #bfdbfe' }}>
            <HistoryOutlined /> Payment History
          </button>
          <button onClick={() => setShowWaGroup(true)}
            className="btn-shine px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5"
            style={{ background: 'linear-gradient(135deg,#25D366,#1ead52)', color: '#fff' }}>
            <WhatsAppOutlined /> Groups
          </button>
          <button
            onClick={() => { setForm(EMPTY); setEditId(null); setShowForm((v) => !v); }}
            className="btn-shine px-3 py-1.5 rounded-lg font-bold text-xs"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #f0d080)', color: '#000' }}>
            {showForm ? 'Cancel' : '+ New Admission'}
          </button>
        </div>
      </div>

      {showForm && (
        <StudentForm
          form={form} setForm={setForm}
          editId={editId} onSubmit={handleSubmit} onCancel={handleCancel}
          groups={groups} submitting={submitting}
        />
      )}

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          className="w-full md:w-56 rounded-md px-3 py-1.5 focus:outline-none text-xs"
          style={{ border: '1px solid #C9A84C', background: '#fff' }}
          placeholder="Search by name, mobile, class..."
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-md px-2 py-1.5 text-xs focus:outline-none"
          style={{ border: '1px solid #C9A84C', background: '#fff' }}
          value={filterStd} onChange={(e) => setFilterStd(e.target.value)}
        >
          <option value="">All Classes</option>
          {STD_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          className="rounded-md px-2 py-1.5 text-xs focus:outline-none"
          style={{ border: '1px solid #C9A84C', background: '#fff' }}
          value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}
        >
          <option value="">All Groups</option>
          {groups.map((g) => <option key={g} value={g}>Group {g}</option>)}
        </select>
        <select
          className="rounded-md px-2 py-1.5 text-xs focus:outline-none"
          style={{ border: '1px solid #C9A84C', background: '#fff' }}
          value={filterMedium} onChange={(e) => setFilterMedium(e.target.value)}
        >
          <option value="">All Mediums</option>
          {MEDIUM_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        {(filterStd || filterGroup || filterMedium) && (
          <button
            className="text-xs px-2 py-1 rounded-md"
            style={{ border: '1px solid #C9A84C', color: '#7a6020', background: '#f5f0e8' }}
            onClick={() => { setFilterStd(''); setFilterGroup(''); setFilterMedium(''); }}
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: '#C9A84C', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <StudentTable students={students} onEdit={handleEdit} onDelete={handleDelete}
          onBulkDelete={handleBulkDelete} onCertificate={setCertStudent}
          paginationProps={paginationProps} />
      )}

      <WaGroupModal open={showWaGroup} onClose={() => setShowWaGroup(false)} students={students} />
      <CertificateModal open={!!certStudent} onClose={() => setCertStudent(null)} student={certStudent} />

      {/* ── Payment History Modal ── */}
      {historyOpen && (() => {
        const now = new Date();
        const groupOptions = [...new Set(allStudentsAll.filter(s => s.groupNo).map(s => s.groupNo))].sort();
        const stdOptions   = filterGroup
          ? [...new Set(allStudentsAll.filter(s => s.groupNo === filterGroup).map(s => s.std))].sort()
          : [...new Set(allStudentsAll.map(s => s.std))].sort();
        const filteredByGroupStd = allStudentsAll.filter(s =>
          (!filterGroup || s.groupNo === filterGroup) &&
          (!filterStd   || s.std     === filterStd)
        );
        const displayStudents = historyStudent
          ? filteredByGroupStd.filter(s => s._id === historyStudent)
          : filteredByGroupStd;

        // months from earliest admission date among displayed students to now
        const earliestAdmission = displayStudents.reduce((min, s) => {
          const d = s.dateOfAdmission ? new Date(s.dateOfAdmission) : null;
          return (d && (!min || d < min)) ? d : min;
        }, null);
        const startDate = earliestAdmission || new Date(now.getFullYear(), now.getMonth() - 5, 1);
        // fees start from the month AFTER admission
        const startYear  = earliestAdmission
          ? (startDate.getMonth() === 11 ? startDate.getFullYear() + 1 : startDate.getFullYear())
          : startDate.getFullYear();
        const startMonth = earliestAdmission
          ? (startDate.getMonth() === 11 ? 0 : startDate.getMonth() + 1)
          : startDate.getMonth();
        const monthsRange = [];
        let cy = startYear, cm = startMonth;
        while (cy < now.getFullYear() || (cy === now.getFullYear() && cm <= now.getMonth())) {
          const d = new Date(cy, cm, 1);
          monthsRange.push({ month: d.toLocaleString('default', { month: 'long' }), year: cy });
          cm++; if (cm > 11) { cm = 0; cy++; }
        }

        const selStyle = { border: '1.5px solid #C9A84C', background: '#fffdf5', color: '#1a1a1a' };
        const statusStyle = (st) => {
          if (!st) return { background: '#f3f4f6', color: '#9ca3af' };
          if (st === 'Paid')    return { background: '#d1fae5', color: '#065f46' };
          if (st === 'Partial') return { background: '#fef3c7', color: '#92400e' };
          if (st === 'Overdue') return { background: '#fee2e2', color: '#dc2626' };
          return { background: '#f3f4f6', color: '#6b7280' };
        };
        const fmtDate = (d) => {
          if (!d) return null;
          const dt = new Date(d);
          return `${dt.getDate()} ${dt.toLocaleString('default', { month: 'short' })}`;
        };
        const cellContent = (fee) => {
          if (!fee) return { label: '—', sub: null };
          if (fee.status === 'Paid')    return { label: `✓ ₹${fee.paidAmount || fee.amount}`, sub: fmtDate(fee.paidDate) };
          if (fee.status === 'Partial') return { label: `₹${fee.paidAmount || 0}/₹${fee.amount}`, sub: fmtDate(fee.paidDate) };
          if (fee.status === 'Overdue') return { label: 'Overdue', sub: null };
          return { label: fee.status, sub: null };
        };
        return (
          <AppModal open onClose={() => { setHistoryOpen(false); setHistoryStudent(''); }} title="Payment History" subtitle={`Since admission · ${monthsRange.length} months`} width={900}>
            <div className="px-5 py-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-gray-500 block mb-1">Group</label>
                  <select value={filterGroup} onChange={e => { setFilterGroup(e.target.value); setFilterStd(''); setHistoryStudent(''); }}
                    className="w-full px-2 py-1.5 rounded-lg text-xs outline-none" style={selStyle}>
                    <option value="">— All Groups —</option>
                    {groupOptions.map(g => <option key={g} value={g}>Group {g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-gray-500 block mb-1">Std</label>
                  <select value={filterStd} onChange={e => { setFilterStd(e.target.value); setHistoryStudent(''); }}
                    className="w-full px-2 py-1.5 rounded-lg text-xs outline-none" style={selStyle}>
                    <option value="">— All Std —</option>
                    {stdOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-gray-500 block mb-1">Student</label>
                  <select value={historyStudent} onChange={e => setHistoryStudent(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg text-xs outline-none" style={selStyle}>
                    <option value="">— All Students —</option>
                    {filteredByGroupStd.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  {(filterGroup || filterStd || historyStudent) && (
                    <button onClick={() => { setFilterGroup(''); setFilterStd(''); setHistoryStudent(''); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold"
                      style={{ background: '#f3f4f6', color: '#374151' }}>Clear</button>
                  )}
                </div>
              </div>

              {displayStudents.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">Koi student nahi mila</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#1a1a1a' }}>
                        <th className="px-3 py-2 text-left font-semibold" style={{ color: '#C9A84C', minWidth: 140 }}>Student</th>
                        {monthsRange.map(({ month, year }) => (
                          <th key={`${month}${year}`} className="px-3 py-2 text-center font-semibold" style={{ color: '#C9A84C', minWidth: 100 }}>
                            {month.slice(0, 3)} '{String(year).slice(2)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {displayStudents.map((s, si) => (
                        <tr key={s._id} style={{ background: si % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                          <td className="px-3 py-2" style={{ minWidth: 160 }}>
                            <div className="font-semibold">{s.name}</div>
                            {s.dateOfAdmission && (
                              <div className="text-[10px] font-medium" style={{ color: '#C9A84C' }}>
                                Adm: {new Date(s.dateOfAdmission).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </div>
                            )}
                            <div className="text-gray-400 text-[10px]">Class {s.std}{s.groupNo ? ` · Grp ${s.groupNo}` : ''}</div>
                          </td>
                          {monthsRange.map(({ month, year }) => {
                            const fee = allFees.find(f =>
                              (f.studentId?._id || f.studentId) === s._id &&
                              f.month === month && f.year === year
                            );
                            const { label, sub } = cellContent(fee);
                            const hasLog = fee?.paymentLogs?.length > 0;
                            return (
                              <td key={`${month}${year}`} className="px-2 py-2 text-center">
                                <span
                                  onClick={() => hasLog && setLogPopup({ fee, studentName: s.name })}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold inline-flex flex-col items-center gap-0.5${hasLog ? ' cursor-pointer hover:opacity-80' : ''}`}
                                  style={statusStyle(fee?.status)}
                                  title={hasLog ? 'Click to see payment details' : undefined}>
                                  <span>{label}</span>
                                  {sub && <span className="font-normal opacity-80">{sub}</span>}
                                  {hasLog && <span className="font-normal opacity-60 text-[9px]">📋 {fee.paymentLogs.length} entry</span>}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="flex gap-4 flex-wrap">
                {[['✓ Paid','#d1fae5','#065f46'],['Partial','#fef3c7','#92400e'],['Overdue','#fee2e2','#dc2626'],['—','#f3f4f6','#9ca3af']].map(([l,bg,c]) => (
                  <span key={l} className="flex items-center gap-1 text-[10px] text-gray-500">
                    <span className="px-2 py-0.5 rounded font-bold" style={{ background: bg, color: c }}>{l}</span>
                    {l === '—' ? 'Not generated' : l === 'Partial' ? 'Partial paid' : l}
                  </span>
                ))}
              </div>
            </div>
          </AppModal>
        );
      })()}
      {/* ── Payment Log Popup ── */}
      {logPopup && (
        <AppModal open onClose={() => setLogPopup(null)}
          title="Payment Details"
          subtitle={`${logPopup.studentName} · ${logPopup.fee.month} ${logPopup.fee.year}`}
          width={340}>
          <div className="px-5 py-4 flex flex-col gap-3">
            <div className="flex justify-between text-xs text-gray-500 pb-1 border-b">
              <span className="font-bold uppercase tracking-wide">Date</span>
              <span className="font-bold uppercase tracking-wide">Amount Paid</span>
            </div>
            {logPopup.fee.paymentLogs.map((log, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {new Date(log.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <span className="font-bold" style={{ color: '#065f46' }}>₹{log.amount}</span>
              </div>
            ))}
            <div className="flex justify-between items-center text-sm border-t pt-2 mt-1">
              <span className="font-black">Total Paid</span>
              <span className="font-black" style={{ color: '#C9A84C' }}>₹{logPopup.fee.paidAmount || logPopup.fee.amount}</span>
            </div>
            {logPopup.fee.status !== 'Paid' && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Remaining</span>
                <span className="font-semibold text-red-600">₹{logPopup.fee.amount - (logPopup.fee.paidAmount || 0)}</span>
              </div>
            )}
          </div>
        </AppModal>
      )}
    </div>
  );
}
