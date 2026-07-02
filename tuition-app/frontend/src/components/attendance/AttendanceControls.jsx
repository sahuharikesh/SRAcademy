import { CheckCircleFilled, CloseCircleFilled, SaveFilled } from '@ant-design/icons';
import { GOLD } from '../../utils/constants';

export default function AttendanceControls({ date, onDateChange, onSetAll, onSave, filterSlot }) {
  return (
    <div className="rounded-xl shadow-md p-4 mb-6 flex flex-wrap items-center gap-3"
      style={{ background: '#fff', border: '1px solid var(--brand-gold, #C9A84C)' }}>
      <div className="flex items-center gap-3 flex-wrap">
        <div>
          <label className="text-xs font-semibold mr-2" style={{ color: '#7a6020' }}>Date:</label>
          <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)}
            className="border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1"
            style={{ borderColor: 'var(--brand-gold, #C9A84C)', focusRingColor: 'var(--brand-gold, #C9A84C)' }} />
        </div>
        {filterSlot}
      </div>
      <div className="flex gap-2 sm:ml-auto">
        <button onClick={() => onSetAll('Present')}
          className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold"
          style={{ background: '#d4edda', color: '#155724' }}>
          <CheckCircleFilled /> All Present
        </button>
        <button onClick={() => onSetAll('Absent')}
          className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold"
          style={{ background: '#f8d7da', color: '#721c24' }}>
          <CloseCircleFilled /> All Absent
        </button>
        <button onClick={onSave}
          className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold" style={GOLD}>
          <SaveFilled /> Save
        </button>
      </div>
    </div>
  );
}
