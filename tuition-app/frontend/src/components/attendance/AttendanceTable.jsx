export default function AttendanceTable({ data, marks, onMark, loading }) {
  if (loading) return <div className="text-center text-gray-400 py-10">Loading...</div>;

  return (
    <div className="rounded-xl shadow-md overflow-x-auto mb-6" style={{ border: '1px solid #C9A84C' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: '#1a1a1a' }}>
            {['#','Student','Class','Group','Status'].map((h) => (
              <th key={h} className="p-3 text-left text-xs font-semibold" style={{ color: '#C9A84C' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={5} className="p-6 text-center text-gray-400">No students found</td></tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.student._id} className="border-b transition"
                style={{ background: marks[row.student._id] === 'Absent' ? '#fff5f5' : '#fff' }}>
                <td className="p-3 text-gray-400">{i + 1}</td>
                <td className="p-3 font-semibold">{row.student.name}</td>
                <td className="p-3">{row.student.std}</td>
                <td className="p-3">{row.student.groupNo || '—'}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    {[
                      { s: 'Present', active: { background: '#28a745', color: '#fff' } },
                      { s: 'Absent',  active: { background: '#dc3545', color: '#fff' } },
                      { s: 'Late',    active: { background: '#ffc107', color: '#000' } },
                    ].map(({ s, active }) => (
                      <button key={s} onClick={() => onMark(row.student._id, s)}
                        className="px-3 py-1 rounded-full text-xs font-semibold border transition"
                        style={marks[row.student._id] === s
                          ? active
                          : { background: '#fff', color: '#666', borderColor: '#ccc' }}>
                        {s}
                      </button>
                    ))}
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
