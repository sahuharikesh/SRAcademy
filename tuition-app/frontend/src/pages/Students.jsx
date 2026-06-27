import { useEffect, useState } from 'react';
import { getStudents, addStudent, updateStudent, deleteStudent, getGroups } from '../api';
import StudentForm, { EMPTY }   from '../components/students/StudentForm';
import StudentTable              from '../components/students/StudentTable';
import WaGroupModal              from '../components/students/WaGroupModal';
import CertificateModal          from '../components/students/CertificateModal';
import { STD_OPTIONS, MEDIUM_OPTIONS } from '../utils/constants';
import { WhatsAppOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [groups,   setGroups]   = useState([]);
  const [form,     setForm]     = useState(EMPTY);
  const [editId,   setEditId]   = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search,        setSearch]        = useState('');
  const [filterStd,     setFilterStd]     = useState('');
  const [filterGroup,   setFilterGroup]   = useState('');
  const [filterMedium,  setFilterMedium]  = useState('');
  const [showWaGroup,    setShowWaGroup]    = useState(false);
  const [certStudent,    setCertStudent]    = useState(null);
  const [submitting,     setSubmitting]     = useState(false);
  const [loading,        setLoading]        = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, g] = await Promise.all([getStudents(), getGroups().catch(() => [])]);
      setStudents(s);
      setGroups(g);
    } catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      if (editId) { await updateStudent(editId, form); toast.success('Student updated!'); }
      else        { await addStudent(form);             toast.success('Student admitted!'); }
      setForm(EMPTY); setEditId(null); setShowForm(false); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Something went wrong'); }
    finally { setSubmitting(false); }
  };

  const handleEdit = (s) => {
    setForm({
      name: s.name, mobile: s.mobile, std: s.std,
      dateOfAdmission: s.dateOfAdmission?.split('T')[0] || '',
      feeType: s.feeType, actualFees: s.actualFees,
      recommendedFees: s.recommendedFees, groupNo: s.groupNo || '',
      medium: Array.isArray(s.medium) ? (s.medium[0] || '') : (s.medium || ''),
      schoolName: s.schoolName || '', comment: s.comment || '',
    });
    setEditId(s._id); setShowForm(true); window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this student?')) return;
    await deleteStudent(id); toast.success('Student removed'); load();
  };

  const handleBulkDelete = async (ids) => {
    try {
      await Promise.all(ids.map((id) => deleteStudent(id)));
      toast.success(`${ids.length} student(s) deleted`);
      load();
    } catch { toast.error('Failed to delete some students'); }
  };

  const handleCancel = () => { setShowForm(false); setForm(EMPTY); setEditId(null); };

  const filtered = students.filter((s) => {
    const matchSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.mobile.includes(search) ||
      s.std.toLowerCase().includes(search.toLowerCase());
    const matchStd    = !filterStd    || s.std === filterStd;
    const matchGroup  = !filterGroup  || s.groupNo === filterGroup;
    const matchMedium = !filterMedium || s.medium === filterMedium;
    return matchSearch && matchStd && matchGroup && matchMedium;
  });

  return (
    <div className="anim-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#1a1a1a' }}>Students</h1>
          <p className="text-xs mt-0.5 font-medium" style={{ color: '#888' }}>Manage admissions & student records</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowWaGroup(true)}
            className="btn-shine px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5"
            style={{ background: 'linear-gradient(135deg,#25D366,#1ead52)', color: '#fff' }}>
            <WhatsAppOutlined /> Groups
          </button>
          <button
            onClick={() => { setForm(EMPTY); setEditId(null); setShowForm((v) => !v); }}
            className="btn-shine px-3 py-1.5 rounded-lg font-bold text-xs"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #f0d080)', color: '#000' }}>
            {showForm ? 'Cancel' : '+ New Admission'}
          </button>
        </div>
      </div>

      {showForm && (
        <StudentForm
          form={form} setForm={setForm}
          editId={editId} onSubmit={handleSubmit} onCancel={handleCancel}
          groups={groups} submitting={submitting}
        />
      )}

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          className="w-full md:w-56 rounded-md px-3 py-1.5 focus:outline-none text-xs"
          style={{ border: '1px solid #C9A84C', background: '#fff' }}
          placeholder="Search by name, mobile, class..."
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-md px-2 py-1.5 text-xs focus:outline-none"
          style={{ border: '1px solid #C9A84C', background: '#fff' }}
          value={filterStd} onChange={(e) => setFilterStd(e.target.value)}
        >
          <option value="">All Classes</option>
          {STD_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          className="rounded-md px-2 py-1.5 text-xs focus:outline-none"
          style={{ border: '1px solid #C9A84C', background: '#fff' }}
          value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}
        >
          <option value="">All Groups</option>
          {groups.map((g) => <option key={g} value={g}>Group {g}</option>)}
        </select>
        <select
          className="rounded-md px-2 py-1.5 text-xs focus:outline-none"
          style={{ border: '1px solid #C9A84C', background: '#fff' }}
          value={filterMedium} onChange={(e) => setFilterMedium(e.target.value)}
        >
          <option value="">All Mediums</option>
          {MEDIUM_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        {(filterStd || filterGroup || filterMedium) && (
          <button
            className="text-xs px-2 py-1 rounded-md"
            style={{ border: '1px solid #C9A84C', color: '#7a6020', background: '#f5f0e8' }}
            onClick={() => { setFilterStd(''); setFilterGroup(''); setFilterMedium(''); }}
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: '#C9A84C', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <StudentTable students={filtered} onEdit={handleEdit} onDelete={handleDelete}
          onBulkDelete={handleBulkDelete} onCertificate={setCertStudent} />
      )}

      <WaGroupModal open={showWaGroup} onClose={() => setShowWaGroup(false)} students={students} />
      <CertificateModal open={!!certStudent} onClose={() => setCertStudent(null)} student={certStudent} />
    </div>
  );
}
