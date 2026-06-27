import { useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import AppModal from '../common/AppModal';
import Pagination from '../common/Pagination';
import { WhatsAppOutlined, PhoneOutlined, CheckOutlined } from '@ant-design/icons';

export default function GroupDetail({ selected, groupStudents, groupFees, totalDue, allFees, onWhatsApp, onPay, onPayAll }) {
  const [showPicker, setShowPicker] = useState(false);
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(1);

  if (!selected) return null;

  const pageSize = 10;

  const unpaidFees = groupFees.filter((f) => f.status !== 'Paid');
  const filteredUnpaid = unpaidFees.filter((f) => {
    const stu = groupStudents.find((s) => s._id === (f.studentId?._id || f.studentId));
    const name = (stu?.name || f.studentId?.name || '').toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const handlePickAndPay = (fee) => {
    setShowPicker(false);
    setSearch('');
    onPay(fee);
  };

  return (
    <div className="rounded-xl p-5 mt-2" style={{ background: '#fffdf5', border: '1px solid #e8d5a3' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-base" style={{ color: '#1a1a1a' }}>Group {selected} — Details</h2>
        <div className="flex gap-2">
          {groupStudents[0]?.mobile && (
            <a href={`tel:${groupStudents[0].mobile}`} title={`Call ${groupStudents[0].mobile}`}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              style={{ background: '#d4edda', color: '#155724' }}>
              <PhoneOutlined />
            </a>
          )}
          {unpaidFees.length > 0 && (
            <button onClick={() => setShowPicker(true)} title="Record Payment"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              style={{ background: '#d4edda', color: '#155724' }}>
              <CheckOutlined />
            </button>
          )}
          {totalDue > 0 && (
            <button onClick={onWhatsApp} title="Send WhatsApp reminder"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg,#25D366,#1ead52)', color: '#fff' }}>
              <WhatsAppOutlined />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {groupStudents.map((s) => {
          const dueAmt = allFees
            .filter((f) => (f.studentId?._id === s._id || f.studentId === s._id) && f.status !== 'Paid')
            .reduce((sum, f) => sum + (f.amount - (f.paidAmount || 0)), 0);
          return (
            <div key={s._id} className="rounded-lg p-3" style={{ background: '#fff', border: '1px solid #C9A84C' }}>
              <div className="font-semibold text-sm">{s.name}</div>
              <div className="text-xs text-gray-500">Class {s.std}</div>
              <div className="text-sm font-semibold mt-1"
                style={{ color: dueAmt > 0 ? '#721c24' : '#155724' }}>
                {dueAmt > 0 ? `Rs. ${dueAmt} Due` : 'Fees Clear'}
              </div>
            </div>
          );
        })}
      </div>

      {groupFees.length > 0 && (
        <>
        <table className="w-full text-xs rounded overflow-hidden">
          <thead>
            <tr style={{ background: '#1a1a1a' }}>
              {['Student', 'Month', 'Total Fee', 'Paid', 'Remaining', 'Status'].map((h) => (
                <th key={h} className="p-2 text-center text-xs font-semibold" style={{ color: '#C9A84C' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupFees.slice((page - 1) * pageSize, page * pageSize).map((f) => {
              const stu       = groupStudents.find((s) => s._id === (f.studentId?._id || f.studentId));
              const paid      = f.paidAmount || 0;
              const remaining = f.amount - paid;
              return (
                <tr key={f._id} className="border-b" style={{ background: '#fff' }}>
                  <td className="p-2 text-center font-medium">{stu?.name || f.studentId?.name}</td>
                  <td className="p-2 text-center">{f.month} {f.year}</td>
                  <td className="p-2 text-center">Rs. {f.amount}</td>
                  <td className="p-2 text-center">
                    {paid > 0
                      ? <span className="font-semibold" style={{ color: '#155724' }}>Rs. {paid}</span>
                      : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="p-2 text-center">
                    <span className="font-semibold" style={{ color: (f.status === 'Paid' || remaining <= 0) ? '#155724' : '#dc2626' }}>
                      {(f.status === 'Paid' || remaining <= 0) ? 'Clear' : `Rs. ${remaining}`}
                    </span>
                  </td>
                  <td className="p-2 text-center"><StatusBadge status={f.status} dueDate={f.dueDate} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination page={page} pageSize={pageSize} total={groupFees.length} onChange={setPage} />
        </>
      )}

      {totalDue > 0 && (
        <div className="mt-3 text-right font-bold text-sm" style={{ color: '#721c24' }}>
          Total Pending: Rs. {totalDue}
        </div>
      )}

      {/* Fee picker modal */}
      <AppModal open={showPicker} onClose={() => { setShowPicker(false); setSearch(''); }}
        title="Select Fee to Pay" subtitle={`Group ${selected}`} width={440}>
        <div className="px-5 py-4 flex flex-col gap-2">
          {/* Pay Total button */}
          <button onClick={() => { setShowPicker(false); setSearch(''); onPayAll(unpaidFees); }}
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-black"
            style={{ background: 'linear-gradient(135deg,#1a1a1a,#2a2a2a)', color: '#C9A84C', border: '2px solid #C9A84C' }}>
            <span>Pay Total ({unpaidFees.length} fee{unpaidFees.length > 1 ? 's' : ''})</span>
            <span>Rs. {totalDue}</span>
          </button>
          <div className="flex items-center gap-2 my-1">
            <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
            <span className="text-xs text-gray-400">or pay individually</span>
            <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
          </div>
          {/* Search by student name */}
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name..."
            className="w-full px-3 py-2 rounded-lg text-xs outline-none"
            style={{ border: '1.5px solid #C9A84C', background: '#fffdf5' }}
          />
          {filteredUnpaid.length === 0 && (
            <p className="text-xs text-center text-gray-400 py-2">No matching fees</p>
          )}
          {filteredUnpaid.map((f) => {
            const stu       = groupStudents.find((s) => s._id === (f.studentId?._id || f.studentId));
            const remaining = f.amount - (f.paidAmount || 0);
            return (
              <button key={f._id} onClick={() => handlePickAndPay(f)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm transition"
                style={{ background: '#fff', border: '1.5px solid #C9A84C' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fffbeb'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}>
                <div className="text-left">
                  <div className="font-semibold text-gray-800">{stu?.name || '—'}</div>
                  <div className="text-xs text-gray-500">{f.month} {f.year}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm" style={{ color: '#dc2626' }}>Rs. {remaining}</span>
                  <span className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: '#d4edda', color: '#155724', fontSize: 11 }}>
                    <CheckOutlined />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </AppModal>
    </div>
  );
}
