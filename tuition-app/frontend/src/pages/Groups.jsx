import { useEffect, useState, Fragment } from 'react';
import { getGroups, getStudentsByGroup, getFees, getStudents, sendWhatsApp } from '../api';
import { buildGroupFeeMsg, feeMatchesStudent } from '../utils/messages';
import GroupDetail from '../components/groups/GroupDetail';
import toast from 'react-hot-toast';

export default function Groups() {
  const [groups,        setGroups]        = useState([]);
  const [allStudents,   setAllStudents]   = useState([]);
  const [selected,      setSelected]      = useState(null);
  const [groupStudents, setGroupStudents] = useState([]);
  const [allFees,       setAllFees]       = useState([]);

  useEffect(() => {
    getGroups().then(setGroups).catch(() => toast.error('Failed to load groups'));
    getFees().then(setAllFees);
    getStudents().then(setAllStudents);
  }, []);

  const handleSelect = async (g) => {
    setSelected((prev) => prev === g ? null : g);
    const students = await getStudentsByGroup(g);
    setGroupStudents(students);
  };

  const groupFees = groupStudents.flatMap((s) =>
    allFees.filter((f) => feeMatchesStudent(f, s))
  );
  const totalDue = groupFees.filter((f) => f.status !== 'Paid').reduce((sum, f) => sum + f.amount, 0);

  const handleWhatsApp = (gStudents, gAllFees) => {
    const students = gStudents || groupStudents;
    const fees     = gAllFees  || allFees;
    if (students.length === 0) return;
    sendWhatsApp(students[0].mobile, buildGroupFeeMsg(students, fees));
  };

  // Build summary rows for the groups table
  const groupRows = groups.map((g) => {
    const students = allStudents.filter((s) => s.groupNo === g);
    const fees     = allFees.filter((f) => students.some((s) => s._id === (f.studentId?._id || f.studentId)));
    const due      = fees.filter((f) => f.status !== 'Paid').reduce((sum, f) => sum + f.amount, 0);
    return { g, students, due };
  });

  return (
    <div className="anim-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#1a1a1a' }}>Family Groups</h1>
          <p className="text-xs mt-0.5 font-medium" style={{ color: '#888' }}>Family-wise fee tracking & bulk messaging</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: '#1a1a1a', color: '#C9A84C' }}>{groups.length} group(s)</span>
      </div>

      {/* Groups Summary Table */}
      <div className="rounded-xl shadow-md overflow-x-auto mb-6" style={{ border: "1px solid #C9A84C", background: "#fff" }}>
        <table className="w-full text-sm text-center">
          <thead>
            <tr style={{ background: "#1a1a1a" }}>
              <th className="p-3 text-xs font-semibold" style={{ color: "#C9A84C" }}>Group No</th>
              <th className="p-3 text-xs font-semibold" style={{ color: "#C9A84C" }}>Students</th>
              <th className="p-3 text-xs font-semibold" style={{ color: "#C9A84C" }}>Names</th>
              <th className="p-3 text-xs font-semibold" style={{ color: "#C9A84C" }}>Total Due</th>
              <th className="p-3 text-xs font-semibold" style={{ color: "#C9A84C" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groupRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  No groups found. Add a Group No while admitting students.
                </td>
              </tr>
            ) : (
              groupRows.map(({ g, students, due }) => (
                <Fragment key={g}>
                  <tr
                    onClick={() => handleSelect(g)}
                    className='border-b cursor-pointer transition' style={{ background: selected === g ? '#fffdf0' : '#fff' }}>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full font-semibold text-xs" style={{ background: "#1a1a1a", color: "#C9A84C" }}>
                        {g}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700">{students.length} student(s)</td>
                    <td className="p-3 text-gray-600">
                      {students.map((s) => s.name).join(', ')}
                    </td>
                    <td className="p-3">
                      {due > 0
                        ? <span className="text-red-600 font-semibold">Rs. {due}</span>
                        : <span className="text-green-600 font-medium">Clear ✓</span>}
                    </td>
                    <td className="p-3 flex justify-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSelect(g); }}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          selected === g ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
                        }`}>
                        {selected === g ? 'Hide' : 'View'}
                      </button>
                      {due > 0 && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const studs = await getStudentsByGroup(g);
                            handleWhatsApp(studs, allFees);
                          }}
                          className="px-3 py-1 rounded text-xs font-semibold" style={{ background: "linear-gradient(135deg, #C9A84C, #f0d080)", color: "#000" }}>
                          WhatsApp
                        </button>
                      )}
                    </td>
                  </tr>
                  {selected === g && (
                    <tr>
                      <td colSpan={5} className="p-4 border-t" style={{ background: "#fffdf5" }}>
                        <GroupDetail
                          selected={selected} groupStudents={groupStudents}
                          groupFees={groupFees} totalDue={totalDue}
                          allFees={allFees} onWhatsApp={() => handleWhatsApp()}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
