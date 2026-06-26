import { GOLD } from '../../utils/constants';

export default function AbsentNotifyPanel({ absentList, onSendOne, onSendAll }) {
  if (absentList.length === 0) return null;

  return (
    <div className="rounded-xl shadow-md p-5" style={{ background: '#fff', border: '1px solid #C9A84C' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-sm" style={{ color: '#1a1a1a' }}>
          ⚠️ Absent Students — WhatsApp Notification ({absentList.length})
        </h2>
        <button onClick={onSendAll} className="px-4 py-2 rounded-lg text-sm font-semibold" style={GOLD}>
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
            <button onClick={() => onSendOne(row)}
              className="px-3 py-1 rounded text-xs font-semibold" style={GOLD}>
              WhatsApp
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
