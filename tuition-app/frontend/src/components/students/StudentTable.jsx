export default function StudentTable({ students, onEdit, onDelete }) {
  return (
    <div className="rounded-xl shadow-md overflow-x-auto" style={{ border: '1px solid #C9A84C' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: '#1a1a1a' }}>
            {['#','Name','Class','Mobile','Group','Fee Type','Fees (Rs.)','Admission Date','Actions'].map((h) => (
              <th key={h} className="p-3 text-left text-xs font-semibold" style={{ color: '#C9A84C' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr><td colSpan={9} className="p-6 text-center text-gray-400">No students found</td></tr>
          ) : (
            students.map((s, i) => (
              <tr key={s._id} className="border-b hover:bg-yellow-50 transition">
                <td className="p-3 text-gray-400">{i + 1}</td>
                <td className="p-3 font-semibold text-gray-800">{s.name}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: '#fff3cd', color: '#856404' }}>{s.std}</span>
                </td>
                <td className="p-3 text-gray-600">{s.mobile}</td>
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
                    <button onClick={() => onEdit(s)}
                      className="px-3 py-1 rounded text-xs font-semibold"
                      style={{ background: '#1a1a1a', color: '#C9A84C', border: '1px solid #C9A84C' }}>
                      Edit
                    </button>
                    <button onClick={() => onDelete(s._id)}
                      className="px-3 py-1 rounded text-xs font-semibold"
                      style={{ background: '#f8d7da', color: '#721c24' }}>
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
