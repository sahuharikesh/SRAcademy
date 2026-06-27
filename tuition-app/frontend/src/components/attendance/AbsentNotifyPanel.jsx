import { GOLD } from '../../utils/constants';
import { WhatsAppOutlined, PhoneOutlined, WarningOutlined } from '@ant-design/icons';

export default function AbsentNotifyPanel({ absentList, onSendOne, onSendAll }) {
  if (absentList.length === 0) return null;

  return (
    <div className="rounded-xl shadow-md p-5" style={{ background: '#fff', border: '1px solid #C9A84C' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-sm" style={{ color: '#1a1a1a' }}>
          <WarningOutlined className="mr-1" />Absent Students — WhatsApp Notification ({absentList.length})
        </h2>
        <button onClick={onSendAll} className="px-3 py-1 rounded-lg text-xs font-semibold" style={GOLD}>
          Send to All
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        {absentList.map((row) => (
          <div key={row.student._id} className="rounded-lg p-3 flex items-center gap-3"
            style={{ background: '#f5f0e8', border: '1px solid #C9A84C' }}>
            <div>
              <div className="font-semibold text-sm">{row.student.name}</div>
              <div className="text-xs text-gray-500">Class {row.student.std} · {row.student.mobile}</div>
            </div>
            <button onClick={() => onSendOne(row)} title="Send WhatsApp"
              className="w-7 h-7 rounded flex items-center justify-center" style={GOLD}>
              <WhatsAppOutlined />
            </button>
            <a href={`tel:${row.student.mobile}`} title="Call"
              className="w-7 h-7 rounded flex items-center justify-center"
              style={{ background: '#d4edda', color: '#155724' }}>
              <PhoneOutlined />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
