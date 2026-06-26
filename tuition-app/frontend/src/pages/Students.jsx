import { useEffect, useState } from 'react';
import { getStudents, addStudent, updateStudent, deleteStudent, getGroups } from '../api';
import StudentForm, { EMPTY } from '../components/students/StudentForm';
import StudentTable            from '../components/students/StudentTable';
import toast from 'react-hot-toast';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [groups,   setGroups]   = useState([]);
  const [form,     setForm]     = useState(EMPTY);
  const [editId,   setEditId]   = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search,   setSearch]   = useState('');

  const load = () => {
    getStudents().then(setStudents).catch(() => toast.error('Failed to load students'));
    getGroups().then(setGroups).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await updateStudent(editId, form); toast.success('Student updated!'); }
      else        { await addStudent(form);             toast.success('Student admitted!'); }
      setForm(EMPTY); setEditId(null); setShowForm(false); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Something went wrong'); }
  };

  const handleEdit = (s) => {
    setForm({
      name: s.name, mobile: s.mobile, std: s.std,
      dateOfAdmission: s.dateOfAdmission?.split('T')[0] || '',
      feeType: s.feeType, actualFees: s.actualFees,
      recommendedFees: s.recommendedFees, groupNo: s.groupNo || '',
      medium: s.medium || [], schoolName: s.schoolName || '', comment: s.comment || '',
    });
    setEditId(s._id); setShowForm(true); window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this student?')) return;
    await deleteStudent(id); toast.success('Student removed'); load();
  };

  const handleCancel = () => { setShowForm(false); setForm(EMPTY); setEditId(null); };

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.mobile.includes(search) ||
    s.std.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="anim-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#1a1a1a' }}>Students</h1>
          <p className="text-xs mt-0.5 font-medium" style={{ color: '#888' }}>Manage admissions & student records</p>
        </div>
        <button
          onClick={() => { setForm(EMPTY); setEditId(null); setShowForm((v) => !v); }}
          className="btn-shine px-4 py-2 rounded-lg font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #C9A84C, #f0d080)', color: '#000' }}
        >
          {showForm ? '✕ Cancel' : '+ New Admission'}
        </button>
      </div>

      {showForm && (
        <StudentForm
          form={form} setForm={setForm}
          editId={editId} onSubmit={handleSubmit} onCancel={handleCancel}
          groups={groups}
        />
      )}

      <div className="mb-4">
        <input
          className="w-full md:w-80 rounded-lg px-4 py-2 focus:outline-none text-sm" style={{ border: "1px solid #C9A84C", background: "#fff" }}
          placeholder="Search by name, mobile, class..."
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <StudentTable students={filtered} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
