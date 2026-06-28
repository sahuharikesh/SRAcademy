import { useEffect, useState, Fragment } from 'react';
import { getGroups, getStudentsByGroup, getFees, getStudents, sendWhatsApp, deleteGroup, payFee } from '../api';
import Pagination from '../components/common/Pagination';
import usePagination from '../hooks/usePagination';
import { WhatsAppOutlined, PhoneOutlined, EyeOutlined, EyeInvisibleOutlined, TeamOutlined, DeleteOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import AppModal from '../components/common/AppModal';
import WaPreviewModal from '../components/common/WaPreviewModal';
import { buildGroupFeeMsg, buildGroupUpiQrUrl, feeMatchesStudent } from '../utils/messages';
import GroupDetail from '../components/groups/GroupDetail';
import { GOLD } from '../utils/constants';
import PageSpinner from '../components/common/PageSpinner';
import toast from 'react-hot-toast';

function PayModal({ fee, open, onClose, onSuccess }) {
  const alreadyPaid = fee?.paidAmount || 0;
  const remaining   = (fee?.amount || 0) - alreadyPaid;
  const [payment, setPayment] = useState('');
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    if (open && fee) setPayment(String(remaining));
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

  const studentName = fee?.studentId?.name || '';
  return (
    <AppModal open={open} onClose={onClose} title="Record Payment"
      subtitle={fee ? `${studentName} — ${fee.month} ${fee.year}` : ''} destroyOnClose>
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
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="font-black">Remaining</span>
              <span className="font-black" style={{ color: '#dc2626' }}>₹{remaining}</span>
            </div>
            <div className="mt-1">
              <label className="text-xs font-bold uppercase tracking-wide mb-1 block" style={{ color: '#6b7280' }}>
                Amount Received Now
              </label>
              <input type="number" min="1" value={payment} autoFocus
                onChange={(e) => setPayment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ border: '1.5px solid #C9A84C', background: '#fffdf5' }} />
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

export default function Groups() {
  const [groups,        setGroups]        = useState([]);
  const [allStudents,   setAllStudents]   = useState([]);
  const [selected,      setSelected]      = useState(null);
  const [groupStudents, setGroupStudents] = useState([]);
  const [allFees,       setAllFees]       = useState([]);
  const [namesModal,    setNamesModal]    = useState(null);
  const [waPreview,     setWaPreview]     = useState(null);
  const [payModal,      setPayModal]      = useState(null);
  const { paginationProps } = usePagination(15);
  const [loading,       setLoading]       = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [g, fRes, sRes] = await Promise.all([getGroups(), getFees({ limit: 1000 }).catch(() => ({})), getStudents({ limit: 1000 }).catch(() => ({}))]);
      setGroups(g);
      setAllFees(fRes.data || fRes);
      setAllStudents(sRes.data || sRes);
    } catch { toast.error('Failed to load groups'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSelect = async (g) => {
    setSelected((prev) => prev === g ? null : g);
    const students = await getStudentsByGroup(g);
    setGroupStudents(students);
  };

  const groupFees = groupStudents.flatMap((s) =>
    allFees.filter((f) => feeMatchesStudent(f, s))
  );
  const totalDue = groupFees.filter((f) => f.status !== 'Paid').reduce((sum, f) => sum + (f.amount - (f.paidAmount || 0)), 0);

  const handleDeleteGroup = (g) => {
    Modal.confirm({
      title: `Delete Group ${g}?`,
      content: 'This will remove the group from all students in this family. Students will not be deleted.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        try {
          await deleteGroup(g);
          toast.success(`Group ${g} deleted`);
          if (selected === g) setSelected(null);
          load();
        } catch { toast.error('Failed to delete group'); }
      },
    });
  };

  const handlePayAll = async (unpaidFees) => {
    try {
      await Promise.all(unpaidFees.map((f) => payFee(f._id, { payment: f.amount - (f.paidAmount || 0) })));
      toast.success(`${unpaidFees.length} fee(s) marked as paid!`);
      load();
    } catch { toast.error('Failed to mark fees as paid'); }
  };

  const handleWhatsApp = (gStudents, gAllFees) => {
    const students = gStudents || groupStudents;
    const fees     = gAllFees  || allFees;
    if (students.length === 0) return;
    const totalDue = students
      .flatMap((s) => fees.filter((f) => feeMatchesStudent(f, s) && f.status !== 'Paid'))
      .reduce((sum, f) => sum + (f.amount - (f.paidAmount || 0)), 0);
    const msg    = buildGroupFeeMsg(students, fees);
    const qrUrl  = buildGroupUpiQrUrl(totalDue, students[0].groupNo);
    setWaPreview({ mobile: students[0].mobile, msg, qrUrl, amount: totalDue, label: `Group ${students[0].groupNo}` });
  };

  // Build summary rows for the groups table
  const allGroupRows = groups.map((g) => {
    const students = allStudents.filter((s) => s.groupNo === g);
    const fees     = allFees.filter((f) => students.some((s) => s._id === (f.studentId?._id || f.studentId)));
    const due      = fees.filter((f) => f.status !== 'Paid').reduce((sum, f) => sum + (f.amount - (f.paidAmount || 0)), 0);
    return { g, students, due };
  });
  const { page, pageSize } = paginationProps;
  const groupRows = allGroupRows.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return <PageSpinner />;

  return (
    <div className="anim-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#1a1a1a' }}>Family Groups</h1>
          <p className="text-xs mt-0.5 font-medium" style={{ color: '#888' }}>Family-wise fee tracking & bulk messaging</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: '#1a1a1a', color: '#C9A84C' }}>{groups.length} group(s)</span>
      </div>

      {/* Groups Summary Table */}
      <div className="rounded-xl shadow-md overflow-x-auto mb-6" style={{ border: "1px solid #C9A84C", background: "#fff" }}>
        <table className="w-full text-xs text-center">
          <thead>
            <tr style={{ background: "#1a1a1a" }}>
              <th className="p-3 text-xs font-semibold" style={{ color: "#C9A84C" }}>Group No</th>
              <th className="p-3 text-xs font-semibold" style={{ color: "#C9A84C" }}>Students</th>
              <th className="p-3 text-xs font-semibold" style={{ color: "#C9A84C" }}>Total Fees</th>
              <th className="p-3 text-xs font-semibold" style={{ color: "#C9A84C" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groupRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-400">
                  No groups found. Add a Group No while admitting students.
                </td>
              </tr>
            ) : (
              groupRows.map(({ g, students, due }) => (
                <Fragment key={g}>
                  <tr
                    onClick={() => handleSelect(g)}
                    className='border-b cursor-pointer transition' style={{ background: selected === g ? '#fffdf0' : '#fff' }}>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full font-semibold text-xs" style={{ background: "#1a1a1a", color: "#C9A84C" }}>
                        {g}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setNamesModal({ g, students }); }}
                        title="View student names"
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: '#f0f4ff', color: '#3730a3', border: '1px solid #c7d2fe' }}>
                        <TeamOutlined />
                        {students.length}
                      </button>
                    </td>
                    <td className="p-3">
                      {due > 0
                        ? <span className="text-red-600 font-semibold">Rs. {due}</span>
                        : <span className="text-green-600 font-medium">Clear</span>}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-2 flex-wrap">
                        <button title={selected === g ? 'Hide' : 'View'}
                          onClick={(e) => { e.stopPropagation(); handleSelect(g); }}
                          className="w-7 h-7 rounded flex items-center justify-center"
                          style={selected === g
                            ? { background: '#4f46e5', color: '#fff' }
                            : { background: '#e5e7eb', color: '#374151' }}>
                          {selected === g ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                        </button>
                        {students[0]?.mobile && (
                          <>
                            <button title="Send WhatsApp"
                              onClick={async (e) => {
                                e.stopPropagation();
                                const studs = await getStudentsByGroup(g);
                                handleWhatsApp(studs, allFees);
                              }}
                              className="w-7 h-7 rounded flex items-center justify-center"
                              style={{ background: 'linear-gradient(135deg,#25D366,#1ead52)', color: '#fff' }}>
                              <WhatsAppOutlined />
                            </button>
                            <a href={`tel:${students[0].mobile}`} title={`Call ${students[0].mobile}`}
                              onClick={(e) => e.stopPropagation()}
                              className="w-7 h-7 rounded flex items-center justify-center"
                              style={{ background: '#d4edda', color: '#155724' }}>
                              <PhoneOutlined />
                            </a>
                          </>
                        )}
                        <button title="Delete Group"
                          onClick={(e) => { e.stopPropagation(); handleDeleteGroup(g); }}
                          className="w-7 h-7 rounded flex items-center justify-center"
                          style={{ background: '#fee2e2', color: '#dc2626' }}>
                          <DeleteOutlined />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {selected === g && (
                    <tr>
                      <td colSpan={4} className="p-4 border-t" style={{ background: "#fffdf5" }}>
                        <GroupDetail
                          selected={selected} groupStudents={groupStudents}
                          groupFees={groupFees} totalDue={totalDue}
                          allFees={allFees} onWhatsApp={() => handleWhatsApp()}
                          onPay={(fee) => setPayModal(fee)}
                          onPayAll={handlePayAll}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination {...paginationProps} total={allGroupRows.length} />

      <WaPreviewModal
        open={!!waPreview}
        onClose={() => setWaPreview(null)}
        title="Family Fee Reminder"
        subtitle={waPreview?.label}
        message={waPreview?.msg}
        qrUrl={waPreview?.qrUrl}
        amount={waPreview?.amount}
        onSend={() => sendWhatsApp(waPreview.mobile, waPreview.msg)}
      />

      <PayModal fee={payModal} open={!!payModal} onClose={() => setPayModal(null)} onSuccess={load} />

      <AppModal open={!!namesModal} onClose={() => setNamesModal(null)}
        title={namesModal ? `Group ${namesModal.g}` : ''}
        subtitle={namesModal ? `${namesModal.students.length} student(s)` : ''}
        width={320}>
        {namesModal && (
          <ul className="px-5 py-4 flex flex-col gap-2">
            {namesModal.students.map((s) => (
              <li key={s._id} className="flex items-center gap-3 text-sm">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background: '#C9A84C', color: '#000' }}>
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{s.name}</div>
                  <div className="text-xs text-gray-400">Class {s.std}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AppModal>
    </div>
  );
}
