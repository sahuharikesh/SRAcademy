import { useState } from 'react';
import { PhoneOutlined, EditOutlined, DeleteOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import Pagination from '../common/Pagination';

export default function StudentTable({ students, onEdit, onDelete, onBulkDelete, onCertificate, paginationProps = {} }) {
  const [selected,  setSelected]  = useState(new Set());

  const allChecked = students.length > 0 && students.every((s) => selected.has(s._id));

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allChecked ? new Set() : new Set(students.map((s) => s._id)));
  };

  const handleBulkDelete = () => {
    Modal.confirm({
      title: `Delete ${selected.size} student(s)?`,
      content: 'This will permanently remove the selected students.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        await onBulkDelete([...selected]);
        setSelected(new Set());
      },
    });
  };

  return (
    <div>
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-2 px-1">
          <span className="text-xs text-gray-500">{selected.size} selected</span>
          <button onClick={handleBulkDelete}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold"
            style={{ background: '#fee2e2', color: '#dc2626' }}>
            <DeleteOutlined /> Delete Selected
          </button>
          <button onClick={() => setSelected(new Set())}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold"
            style={{ background: '#f3f4f6', color: '#6b7280', border: '1.5px solid #9ca3af' }}>
            Clear
          </button>
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
              {['Name','Class','Mobile','School','Medium','Group','Fee Type','Fees (Rs.)','Admission Date','Actions'].map((h) => (
                <th key={h} className="p-3 text-left text-xs font-semibold" style={{ color: '#C9A84C' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan={12} className="p-6 text-center text-gray-400">No students found</td></tr>
            ) : (
              students.map((s, i) => (
                <tr key={s._id} className="border-b hover:bg-yellow-50 transition"
                  style={{ background: selected.has(s._id) ? '#fffbeb' : '' }}>
                  <td className="p-3">
                    <input type="checkbox" checked={selected.has(s._id)} onChange={() => toggle(s._id)}
                      className="w-3.5 h-3.5 accent-yellow-500 cursor-pointer" />
                  </td>
                  <td className="p-3 font-semibold text-gray-800">{s.name}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: '#fff3cd', color: '#856404' }}>{s.std}</span>
                  </td>
                  <td className="p-3 text-gray-600">{s.mobile}</td>
                  <td className="p-3 text-gray-600">{s.schoolName || '—'}</td>
                  <td className="p-3">
                    {(() => { const m = Array.isArray(s.medium) ? s.medium[0] : s.medium; return m
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: '#e8f4f8', color: '#1a6080' }}>{m}</span>
                      : '—'; })()}
                  </td>
                  <td className="p-3">
                    {s.groupNo
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: '#1a1a1a', color: '#C9A84C' }}>{s.groupNo}</span>
                      : '—'}
                  </td>
                  <td className="p-3 text-gray-600">{s.feeType}</td>
                  <td className="p-3 font-semibold" style={{ color: '#1a1a1a' }}>Rs. {s.recommendedFees}</td>
                  <td className="p-3 text-gray-600">{new Date(s.dateOfAdmission).toLocaleDateString('en-IN')}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <a href={`tel:${s.mobile}`} title="Call"
                        className="w-7 h-7 rounded flex items-center justify-center"
                        style={{ background: '#d4edda', color: '#155724' }}>
                        <PhoneOutlined />
                      </a>
                      <button onClick={() => onCertificate(s)} title="Generate Certificate"
                        className="w-7 h-7 rounded flex items-center justify-center"
                        style={{ background: '#e0e7ff', color: '#3730a3' }}>
                        <SafetyCertificateOutlined />
                      </button>
                      <button onClick={() => onEdit(s)} title="Edit"
                        className="w-7 h-7 rounded flex items-center justify-center"
                        style={{ background: '#1a1a1a', color: '#C9A84C', border: '1px solid #C9A84C' }}>
                        <EditOutlined />
                      </button>
                      <button onClick={() => onDelete(s._id)} title="Remove"
                        className="w-7 h-7 rounded flex items-center justify-center"
                        style={{ background: '#f8d7da', color: '#721c24' }}>
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
    </div>
  );
}
