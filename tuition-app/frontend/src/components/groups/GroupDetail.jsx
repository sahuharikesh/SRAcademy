import StatusBadge from '../common/StatusBadge';
import { GOLD } from '../../utils/constants';

export default function GroupDetail({ selected, groupStudents, groupFees, totalDue, allFees, onWhatsApp }) {
  if (!selected) return null;

  return (
    <div className="rounded-xl p-5 mt-2" style={{ background: '#fffdf5', border: '1px solid #e8d5a3' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-base" style={{ color: '#1a1a1a' }}>Group {selected} — Details</h2>
        {totalDue > 0 && (
          <button onClick={onWhatsApp} className="px-4 py-2 rounded-lg text-sm font-semibold" style={GOLD}>
            WhatsApp — Rs. {totalDue} Due
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {groupStudents.map((s) => {
          const dueAmt = allFees
            .filter((f) => (f.studentId?._id === s._id || f.studentId === s._id) && f.status !== 'Paid')
            .reduce((sum, f) => sum + f.amount, 0);
          return (
            <div key={s._id} className="rounded-lg p-3" style={{ background: '#fff', border: '1px solid #C9A84C' }}>
              <div className="font-semibold text-sm">{s.name}</div>
              <div className="text-xs text-gray-500">Class {s.std} · {s.mobile}</div>
              <div className={`text-sm font-semibold mt-1`}
                style={{ color: dueAmt > 0 ? '#721c24' : '#155724' }}>
                {dueAmt > 0 ? `Rs. ${dueAmt} Due` : '✓ Fees Clear'}
              </div>
            </div>
          );
        })}
      </div>

      {groupFees.length > 0 && (
        <table className="w-full text-sm rounded overflow-hidden">
          <thead>
            <tr style={{ background: '#1a1a1a' }}>
              {['Student','Month','Amount','Status'].map((h) => (
                <th key={h} className="p-2 text-left text-xs font-semibold" style={{ color: '#C9A84C' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupFees.map((f) => {
              const stu = groupStudents.find((s) => s._id === (f.studentId?._id || f.studentId));
              return (
                <tr key={f._id} className="border-b" style={{ background: '#fff' }}>
                  <td className="p-2 font-medium">{stu?.name || f.studentId?.name}</td>
                  <td className="p-2">{f.month} {f.year}</td>
                  <td className="p-2">Rs. {f.amount}</td>
                  <td className="p-2"><StatusBadge status={f.status} dueDate={f.dueDate} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {totalDue > 0 && (
        <div className="mt-3 text-right font-bold text-sm" style={{ color: '#721c24' }}>
          Total Pending: Rs. {totalDue}
        </div>
      )}
    </div>
  );
}
