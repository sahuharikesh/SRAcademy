import { GOLD } from '../../utils/constants';

export default function AttendanceControls({ date, onDateChange, onSetAll, onSave }) {
  return (
    <div className="rounded-xl shadow-md p-4 mb-6 flex flex-wrap items-center gap-3"
      style={{ background: '#fff', border: '1px solid #C9A84C' }}>
      <div>
        <label className="text-xs font-semibold mr-2" style={{ color: '#7a6020' }}>Date:</label>
        <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)}
          className="border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1"
          style={{ borderColor: '#C9A84C', focusRingColor: '#C9A84C' }} />
      </div>
      <div className="flex gap-2 flex-wrap w-full sm:w-auto sm:ml-auto">
        <button onClick={() => onSetAll('Present')}
          className="px-3 py-1 rounded text-xs font-semibold"
          style={{ background: '#d4edda', color: '#155724' }}>
          Mark All Present
        </button>
        <button onClick={() => onSetAll('Absent')}
          className="px-3 py-1 rounded text-xs font-semibold"
          style={{ background: '#f8d7da', color: '#721c24' }}>
          Mark All Absent
        </button>
        <button onClick={onSave} className="px-3 py-1 rounded text-xs font-semibold" style={GOLD}>
          Save Attendance
        </button>
      </div>
    </div>
  );
}
