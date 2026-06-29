import { useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import { updateFeeComments } from '../../api';
import { GOLD } from '../../utils/constants';
import AppModal from '../common/AppModal';
import Pagination from '../common/Pagination';
import { Modal } from 'antd';
import toast from 'react-hot-toast';
import { PhoneOutlined, CheckOutlined, WhatsAppOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';

function PendingModal({ fee, open, onClose, onCommentSaved }) {
  const [comment, setComment] = useState(fee?.comments || '');
  const [saving, setSaving] = useState(false);
  const { pendingBreakdown = [], lastPending = 0 } = fee || {};

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
    <AppModal open={open} onClose={onClose} title="Pending Dues Breakdown"
      subtitle={fee?.studentId?.name} width={480} destroyOnClose>
      {fee && (
        <>
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
              className="flex-1 py-1.5 rounded-lg text-xs font-black"
              style={{ background: '#e5e7eb', color: '#374151' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-1.5 rounded-lg text-xs font-black"
              style={GOLD}>
              {saving ? 'Saving…' : 'Save & Close'}
            </button>
          </div>
        </>
      )}
    </AppModal>
  );
}

export default function FeeTable({ fees, onPay, onWhatsApp, onDelete, onBulkDelete, onCommentSaved, paginationProps = {} }) {
  const [pendingModal, setPendingModal] = useState(null);
  const [selected,     setSelected]     = useState(new Set());

  const allChecked = fees.length > 0 && fees.every((f) => selected.has(f._id));

  const toggle = (id) => setSelected((prev) => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
  });

  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(fees.map((f) => f._id)));

  const handleBulkDelete = () => {
    Modal.confirm({
      title: `Delete ${selected.size} fee record(s)?`,
      content: 'This will permanently remove the selected fee records.',
      okText: 'Delete', okType: 'danger', cancelText: 'Cancel', centered: true,
      onOk: async () => { await onBulkDelete([...selected]); setSelected(new Set()); },
    });
  };

  return (
    <>
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-2 px-1">
          <span className="text-xs text-gray-500">{selected.size} selected</span>
          <button onClick={handleBulkDelete}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold"
            style={{ background: '#fee2e2', color: '#dc2626' }}>
            <DeleteOutlined /> Delete Selected
          </button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-gray-400 underline">Clear</button>
        </div>
      )}
      <div className="rounded-xl shadow-md overflow-x-auto" style={{ border: '1px solid #C9A84C' }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: '#1a1a1a' }}>
              <th className="p-3">
                <input type="checkbox" checked={allChecked} onChange={toggleAll}
                  className="w-3.5 h-3.5 accent-yellow-500 cursor-pointer" />
              </th>
              {['Student', 'Class', 'Group', 'Adm Date', 'Amount', 'Last Pending', 'Due Date', 'Status', 'Actions'].map((h) => (
                <th key={h} className="p-3 text-left text-xs font-semibold" style={{ color: '#C9A84C' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fees.length === 0 ? (
              <tr><td colSpan={10} className="p-6 text-center text-gray-400">No records found</td></tr>
            ) : (
              fees.map((fee, i) => (
                <tr key={fee._id} className="tr-anim border-b"
                  style={{ animationDelay: `${Math.min(i * 40, 300)}ms`, background: selected.has(fee._id) ? '#fffbeb' : '' }}>
                  <td className="p-3">
                    <input type="checkbox" checked={selected.has(fee._id)} onChange={() => toggle(fee._id)}
                      className="w-3.5 h-3.5 accent-yellow-500 cursor-pointer" />
                  </td>
                  <td className="p-3 font-semibold">{fee.studentId?.name}</td>
                  <td className="p-3">{fee.studentId?.std}</td>
                  <td className="p-3">
                    {fee.studentId?.groupNo
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#1a1a1a', color: '#C9A84C' }}>{fee.studentId.groupNo}</span>
                      : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="p-3">
                    {fee.studentId?.dateOfAdmission
                      ? new Date(fee.studentId.dateOfAdmission).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
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
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #C9A84C', fontSize: 11 }}>
                        <InfoCircleOutlined />
                      </button>
                    </div>
                  </td>
                  <td className="p-3">{new Date(fee.dueDate).toLocaleDateString('en-IN')}</td>
                  <td className="p-3"><StatusBadge status={fee.status} dueDate={fee.dueDate} /></td>
                  <td className="p-3">
                    <div className="flex gap-1 flex-nowrap">
                      {fee.status === 'Paid' ? (
                        <span className="text-xs text-gray-400">
                          Paid on {fee.paidDate ? new Date(fee.paidDate).toLocaleDateString('en-IN') : '—'}
                        </span>
                      ) : (
                        <>
                          <button onClick={() => onPay(fee)} title={fee.status === 'Partial' ? `Pay ₹${fee.amount - (fee.paidAmount || 0)} left` : 'Pay'}
                            className="w-7 h-7 rounded flex items-center justify-center"
                            style={{ background: '#d4edda', color: '#155724' }}>
                            <CheckOutlined />
                          </button>
                          <button onClick={() => onWhatsApp(fee)} title={fee.notificationSent ? 'WhatsApp sent' : 'Send WhatsApp'}
                            className="w-7 h-7 rounded flex items-center justify-center"
                            style={fee.notificationSent ? { background: '#e2e3e5', color: '#666' } : GOLD}>
                            <WhatsAppOutlined />
                          </button>
                          <a href={`tel:${fee.studentId?.mobile}`} title="Call"
                            className="w-7 h-7 rounded flex items-center justify-center"
                            style={{ background: '#d1ecf1', color: '#0c5460' }}>
                            <PhoneOutlined />
                          </a>
                        </>
                      )}
                      <button onClick={() => onDelete(fee)} title="Delete"
                        className="w-7 h-7 rounded flex items-center justify-center"
                        style={{ background: '#fee2e2', color: '#dc2626' }}>
                        <DeleteOutlined />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination {...paginationProps} />

      <PendingModal
        fee={pendingModal}
        open={!!pendingModal}
        onClose={() => setPendingModal(null)}
        onCommentSaved={onCommentSaved}
      />
    </>
  );
}
