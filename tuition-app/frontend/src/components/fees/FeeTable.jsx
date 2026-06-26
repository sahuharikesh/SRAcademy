import { useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import { updateFeeComments } from '../../api';
import { GOLD } from '../../utils/constants';
import toast from 'react-hot-toast';

function PendingModal({ fee, onClose, onCommentSaved }) {
  const [comment, setComment] = useState(fee.comments || '');
  const [saving, setSaving] = useState(false);
  const { pendingBreakdown = [], lastPending = 0 } = fee;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateFeeComments(fee._id, comment);
      onCommentSaved(fee._id, comment);
      toast.success('Comment saved');
      onClose();
    } catch {
      toast.error('Failed to save comment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#fff', border: '2px solid #C9A84C' }}>

        {/* Header */}
        <div className="px-5 py-4 flex items-start justify-between"
          style={{ background: 'linear-gradient(135deg,#1a1a1a,#2a2a2a)', borderBottom: '2px solid #C9A84C' }}>
          <div>
            <h2 className="text-sm font-black text-white">Pending Dues Breakdown</h2>
            <p className="text-xs mt-0.5" style={{ color: '#C9A84C' }}>{fee.studentId?.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl font-bold leading-none">✕</button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          {pendingBreakdown.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No previous pending dues</p>
          ) : (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: '#1a1a1a' }}>
                    {['Month', 'Amount', 'Paid', 'Pending', 'Status'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-semibold" style={{ color: '#C9A84C' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingBreakdown.map((row, i) => (
                    <tr key={i} className="border-b last:border-0" style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td className="px-3 py-2 font-semibold">{row.month} {row.year}</td>
                      <td className="px-3 py-2">₹{row.amount}</td>
                      <td className="px-3 py-2">₹{row.paidAmount || 0}</td>
                      <td className="px-3 py-2 font-bold" style={{ color: '#dc2626' }}>₹{row.pending}</td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            background: row.status === 'Overdue' ? '#fee2e2' : row.status === 'Partial' ? '#fef3c7' : '#fef9c3',
                            color: row.status === 'Overdue' ? '#dc2626' : '#92400e',
                          }}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#1a1a1a' }}>
                    <td colSpan={3} className="px-3 py-2 text-xs font-black" style={{ color: '#C9A84C' }}>Total Pending</td>
                    <td colSpan={2} className="px-3 py-2 text-sm font-black" style={{ color: '#f87171' }}>₹{lastPending}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Comments */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: '#6b7280' }}>Comments / Notes</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add any notes about this student's pending dues..."
              className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none"
              style={{ border: '1.5px solid #C9A84C', color: '#1a1a1a', background: '#fffdf5' }}
            />
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-black"
            style={{ background: '#e5e7eb', color: '#374151' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-lg text-sm font-black"
            style={GOLD}>
            {saving ? 'Saving…' : 'Save & Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FeeTable({ fees, onPay, onWhatsApp, onDelete, onCommentSaved }) {
  const [pendingModal, setPendingModal] = useState(null);

  return (
    <>
      <div className="rounded-xl shadow-md overflow-x-auto" style={{ border: '1px solid #C9A84C' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#1a1a1a' }}>
              {['Student', 'Class', 'Group', 'Month', 'Amount', 'Last Pending', 'Due Date', 'Status', 'Actions'].map((h) => (
                <th key={h} className="p-3 text-left text-xs font-semibold" style={{ color: '#C9A84C' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fees.length === 0 ? (
              <tr><td colSpan={9} className="p-6 text-center text-gray-400">No records found</td></tr>
            ) : (
              fees.map((fee, i) => (
                <tr key={fee._id} className="tr-anim border-b" style={{ animationDelay: `${Math.min(i * 40, 300)}ms` }}>
                  <td className="p-3 font-semibold">{fee.studentId?.name}</td>
                  <td className="p-3">{fee.studentId?.std}</td>
                  <td className="p-3">{fee.studentId?.groupNo || '—'}</td>
                  <td className="p-3">{fee.month} {fee.year}</td>
                  <td className="p-3 font-semibold">
                    ₹{fee.amount}
                    {fee.status === 'Partial' && (
                      <div className="text-xs font-normal" style={{ color: '#b45309' }}>
                        Paid: ₹{fee.paidAmount || 0}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      {fee.lastPending > 0 ? (
                        <span className="font-bold" style={{ color: '#dc2626' }}>₹{fee.lastPending}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                      <button
                        onClick={() => setPendingModal(fee)}
                        title="View pending breakdown"
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0"
                        style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #C9A84C' }}>
                        i
                      </button>
                    </div>
                  </td>
                  <td className="p-3">{new Date(fee.dueDate).toLocaleDateString('en-IN')}</td>
                  <td className="p-3"><StatusBadge status={fee.status} dueDate={fee.dueDate} /></td>
                  <td className="p-3">
                    <div className="flex gap-2 flex-wrap">
                      {fee.status === 'Paid' ? (
                        <span className="text-xs text-gray-400">
                          Paid on {fee.paidDate ? new Date(fee.paidDate).toLocaleDateString('en-IN') : '—'}
                        </span>
                      ) : (
                        <>
                          <button onClick={() => onPay(fee)}
                            className="px-3 py-1 rounded text-xs font-semibold"
                            style={{ background: '#d4edda', color: '#155724' }}>
                            {fee.status === 'Partial'
                              ? `Pay ₹${fee.amount - (fee.paidAmount || 0)} Left`
                              : 'Pay'}
                          </button>
                          <button onClick={() => onWhatsApp(fee)}
                            className="px-3 py-1 rounded text-xs font-semibold"
                            style={fee.notificationSent
                              ? { background: '#e2e3e5', color: '#666' }
                              : GOLD}>
                            {fee.notificationSent ? 'Sent' : 'WhatsApp'}
                          </button>
                        </>
                      )}
                      <button onClick={() => onDelete(fee)}
                        className="px-3 py-1 rounded text-xs font-semibold"
                        style={{ background: '#fee2e2', color: '#dc2626' }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pendingModal && (
        <PendingModal
          fee={pendingModal}
          onClose={() => setPendingModal(null)}
          onCommentSaved={onCommentSaved}
        />
      )}
    </>
  );
}
