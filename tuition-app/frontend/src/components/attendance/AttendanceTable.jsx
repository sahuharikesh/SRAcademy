import { useEffect } from 'react';
import { PhoneOutlined, CheckOutlined, CloseOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Pagination from '../common/Pagination';
import usePagination from '../../hooks/usePagination';

export default function AttendanceTable({ data, marks, onMark, loading }) {
  const { paginationProps, reset } = usePagination(15);
  const { page, pageSize } = paginationProps;

  useEffect(() => { reset(); }, [data.length]);

  if (loading) return <div className="text-center text-gray-400 py-10">Loading...</div>;

  const paged = data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
    <div className="rounded-xl shadow-md overflow-x-auto mb-6" style={{ border: '1px solid var(--brand-gold, #C9A84C)' }}>
      <table className="w-full text-xs">
        <thead>
          <tr style={{ background: 'var(--brand-dark, #1a1a1a)' }}>
            {['Student','Class','Status','Call','Group'].map((h) => (
              <th key={h} className="p-3 text-left text-xs font-semibold" style={{ color: 'var(--brand-gold, #C9A84C)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paged.length === 0 ? (
            <tr><td colSpan={6} className="p-6 text-center text-gray-400">No students found</td></tr>
          ) : (
            paged.map((row, i) => (
              <tr key={row.student._id} className="border-b transition"
                style={{ background: marks[row.student._id] === 'Absent' ? '#fff5f5' : '#fff' }}>
                <td className="p-3 font-semibold">{row.student.name}</td>
                <td className="p-3">{row.student.std}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    {[
                      { s: 'Present', active: { background: '#28a745', color: '#fff' }, icon: <CheckOutlined /> },
                      { s: 'Absent',  active: { background: '#dc3545', color: '#fff' }, icon: <CloseOutlined /> },
                      { s: 'Late',    active: { background: '#ffc107', color: '#000' }, icon: <ClockCircleOutlined /> },
                    ].map(({ s, active, icon }) => (
                      <button key={s} onClick={() => onMark(row.student._id, s)} title={s}
                        className="w-7 h-7 rounded-full flex items-center justify-center border transition"
                        style={marks[row.student._id] === s
                          ? active
                          : { background: '#fff', color: '#666', borderColor: '#ccc' }}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="p-3">
                  <a href={`tel:${row.student.mobile}`} title="Call"
                    className="w-7 h-7 rounded flex items-center justify-center"
                    style={{ background: '#d4edda', color: '#155724' }}>
                    <PhoneOutlined />
                  </a>
                </td>
                <td className="p-3">
                  {row.student.groupNo
                    ? <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'var(--brand-dark, #1a1a1a)', color: 'var(--brand-gold, #C9A84C)' }}>{row.student.groupNo}</span>
                    : <span className="text-gray-400">—</span>}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    <Pagination {...paginationProps} total={data.length} />
    </>
  );
}
