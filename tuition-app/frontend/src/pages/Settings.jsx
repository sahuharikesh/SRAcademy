import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { register, getUsers, updateUser, deleteUser, adminUploadLogo, adminUploadSignature } from '../api';
import { useAcademy } from '../context/AcademyContext';
import AppModal from '../components/common/AppModal';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const gold = 'var(--brand-gold, #C9A84C)';
const dark = 'var(--brand-dark, #1a1a1a)';

const API_ORIGIN = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/api\/?$/, '');
const assetUrl = (path) => (path ? (path.startsWith('http') ? path : `${API_ORIGIN}${path}`) : '');

const inputCls = "px-3 py-2 rounded-lg text-sm outline-none w-full";
const inputStyle = { border: `1.5px solid ${gold}`, background: '#fffdf5' };

function ImageUploadBox({ label, src, onSelect, disabled }) {
  const inputRef = useRef(null);
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{ background: '#f9fafb', border: `1.5px solid ${gold}55` }}>
          {src ? <img src={src} alt={label} className="w-full h-full object-contain" /> : <span className="text-[10px] text-gray-400">No image</span>}
        </div>
        {onSelect && (
          <>
            <button type="button" disabled={disabled} onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg text-xs font-black"
              style={{ background: disabled ? '#e5e7eb' : dark, color: disabled ? '#9ca3af' : gold, border: `1.5px solid ${disabled ? '#e5e7eb' : gold}` }}>
              Choose Image
            </button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { if (e.target.files[0]) onSelect(e.target.files[0]); e.target.value = ''; }} />
          </>
        )}
      </div>
    </div>
  );
}

const DEFAULT_STD_LIST     = ['Jr. KG', 'Sr. KG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
const DEFAULT_SUBJECT_LIST = ['Maths', 'Science', 'EVS-1', 'EVS-2', 'English', 'Marathi', 'Hindi', 'History/Civics', 'Geography', 'Sanskrit'];

const emptyAdminForm = {
  academyName: '', academyTitle: '', name: '', email: '', password: '', mobile: '', upiId: '',
  primaryColor: '#1a1a1a', themeColor: '#C9A84C', role: 'admin',
  stdList: DEFAULT_STD_LIST.join(', '), subjectList: DEFAULT_SUBJECT_LIST.join(', '),
};

function AcademyFormModal({ open, onClose, mode, record, onSaved }) {
  const readOnly = mode === 'view';
  const { academy, refresh } = useAcademy() || {};
  const [form, setForm] = useState(emptyAdminForm);
  const [logoFile, setLogoFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [signaturePreview, setSignaturePreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(record
        ? {
            academyName: record.academyName || '', academyTitle: record.academyTitle || '', name: record.name || '',
            email: record.email || '', password: '', mobile: record.mobile || '', upiId: record.upiId || '',
            primaryColor: record.primaryColor || '#1a1a1a', themeColor: record.themeColor || '#C9A84C',
            role: record.role || 'admin',
            stdList: (record.stdList?.length ? record.stdList : DEFAULT_STD_LIST).join(', '),
            subjectList: (record.subjectList?.length ? record.subjectList : DEFAULT_SUBJECT_LIST).join(', '),
          }
        : emptyAdminForm);
      setLogoFile(null);
      setSignatureFile(null);
      setLogoPreview('');
      setSignaturePreview('');
    }
  }, [open, record]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const selectLogo = (file) => { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); };
  const selectSignature = (file) => { setSignatureFile(file); setSignaturePreview(URL.createObjectURL(file)); };

  const toArray = (csv) => csv.split(',').map((s) => s.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let id = record?.id;
      const payloadBase = { ...form, stdList: toArray(form.stdList), subjectList: toArray(form.subjectList) };
      if (mode === 'create') {
        // register() creates the account + returns a token for it, but we
        // deliberately don't persist it — that would switch the current
        // (admin) session over to the newly created academy.
        const res = await register(payloadBase);
        id = res.user.id;
        toast.success(`Academy "${form.academyName}" created!`);
      } else {
        const { email, ...payload } = payloadBase; // email isn't editable; a blank password is ignored server-side
        await updateUser(id, payload);
        toast.success('Academy updated!');
      }
      if (logoFile) await adminUploadLogo(id, logoFile);
      if (signatureFile) await adminUploadSignature(id, signatureFile);
      if (academy?.id === id) await refresh?.(); // keep navbar branding in sync when editing self
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    }
    setSaving(false);
  };

  const title = mode === 'create' ? 'Create New Academy' : mode === 'edit' ? 'Edit Academy' : 'Academy Details';

  return (
    <AppModal open={open} onClose={onClose} title={title} width={Math.min(980, typeof window !== 'undefined' ? window.innerWidth - 32 : 980)}>
      <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ImageUploadBox label="Academy Logo" src={logoPreview || assetUrl(record?.logoUrl)} onSelect={readOnly ? null : selectLogo} disabled={saving} />
          <ImageUploadBox label="Signature" src={signaturePreview || assetUrl(record?.signatureUrl)} onSelect={readOnly ? null : selectSignature} disabled={saving} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Academy Name</label>
            <input value={form.academyName} onChange={(e) => set('academyName', e.target.value)} required disabled={readOnly} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Academy Title / Tagline</label>
            <input value={form.academyTitle} onChange={(e) => set('academyTitle', e.target.value)} placeholder="e.g. Excellence in Education" disabled={readOnly} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Owner / Admin Name</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} required disabled={readOnly} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Mobile</label>
            <input value={form.mobile} onChange={(e) => set('mobile', e.target.value)} disabled={readOnly} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Login Email</label>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required disabled={readOnly || mode === 'edit'} className={inputCls} style={{ ...inputStyle, opacity: mode === 'edit' ? 0.6 : 1 }} />
          </div>
          {mode !== 'view' && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
                Password {mode === 'edit' && <span className="normal-case font-normal">(leave blank to keep current)</span>}
              </label>
              <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required={mode === 'create'} className={inputCls} style={inputStyle} />
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">UPI ID</label>
            <input value={form.upiId} onChange={(e) => set('upiId', e.target.value)} placeholder="e.g. name@upi" disabled={readOnly} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Role</label>
            <select value={form.role} onChange={(e) => set('role', e.target.value)} disabled={readOnly} className={inputCls} style={inputStyle}>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Class List (comma separated)</label>
            <input value={form.stdList} onChange={(e) => set('stdList', e.target.value)} placeholder="e.g. Jr. KG, Sr. KG, 1st, 2nd" disabled={readOnly} className={inputCls} style={inputStyle} />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Subject List (comma separated)</label>
            <input value={form.subjectList} onChange={(e) => set('subjectList', e.target.value)} placeholder="e.g. Maths, Science, English" disabled={readOnly} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Primary Theme (background)</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.primaryColor} onChange={(e) => set('primaryColor', e.target.value)} disabled={readOnly}
                className="h-9 w-12 rounded-lg cursor-pointer flex-shrink-0" style={{ border: `1.5px solid ${gold}`, padding: 2, background: '#fffdf5' }} />
              <input value={form.primaryColor} onChange={(e) => set('primaryColor', e.target.value)} disabled={readOnly} className={inputCls} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Secondary Theme (accent)</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.themeColor} onChange={(e) => set('themeColor', e.target.value)} disabled={readOnly}
                className="h-9 w-12 rounded-lg cursor-pointer flex-shrink-0" style={{ border: `1.5px solid ${gold}`, padding: 2, background: '#fffdf5' }} />
              <input value={form.themeColor} onChange={(e) => set('themeColor', e.target.value)} disabled={readOnly} className={inputCls} style={inputStyle} />
            </div>
          </div>
        </div>
        {!readOnly && (
          <button type="submit" disabled={saving}
            className="py-2.5 rounded-xl text-sm font-black mt-2"
            style={{ background: saving ? '#e5e7eb' : dark, color: saving ? '#9ca3af' : gold, border: `1.5px solid ${saving ? '#e5e7eb' : gold}` }}>
            {saving ? 'Saving...' : mode === 'create' ? 'Create Academy' : 'Save Changes'}
          </button>
        )}
      </form>
    </AppModal>
  );
}

function AcademyManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { mode: 'create'|'edit'|'view', record }
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try { setUsers(await getUsers()); }
    catch { toast.error('Failed to load academies'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete academy "${u.academyName}"? This cannot be undone.`)) return;
    setDeletingId(u.id);
    try { await deleteUser(u.id); toast.success('Academy deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Delete failed'); }
    setDeletingId(null);
  };

  return (
    <div className="rounded-2xl p-5" style={{ background: '#fff', border: `1.5px solid ${gold}33` }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-500">All academy accounts on this platform.</p>
        <button onClick={() => setModal({ mode: 'create', record: null })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black flex-shrink-0"
          style={{ background: dark, color: gold, border: `1.5px solid ${gold}` }}>
          <PlusOutlined /> Create New Account
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-sm text-gray-400">Loading...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-400">No academies yet</div>
      ) : (
        <div className="rounded-xl overflow-hidden overflow-x-auto" style={{ border: `1.5px solid ${gold}33` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: dark }}>
                {['Academy', 'Owner', 'Email', 'Mobile', 'Role', 'Created At', 'Actions'].map((h) => (
                  <th key={h} style={{ color: gold, padding: '8px 12px', textAlign: h === 'Actions' ? 'center' : 'left', fontSize: 10, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? `1px solid ${gold}18` : 'none', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '9px 12px', fontWeight: 700, color: dark, fontSize: 12 }}>{u.academyName}</td>
                  <td style={{ padding: '9px 12px', fontSize: 12, color: '#444' }}>{u.name}</td>
                  <td style={{ padding: '9px 12px', fontSize: 12, color: '#666' }}>{u.email}</td>
                  <td style={{ padding: '9px 12px', fontSize: 12, color: '#666' }}>{u.mobile || '—'}</td>
                  <td style={{ padding: '9px 12px', fontSize: 11 }}>
                    <span className="px-1.5 py-0.5 rounded font-bold" style={{ background: u.role === 'super_admin' ? '#fef3c7' : '#e5e7eb', color: u.role === 'super_admin' ? '#92400e' : '#374151' }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '9px 12px', fontSize: 12, color: '#666', whiteSpace: 'nowrap' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                  <td style={{ padding: '9px 12px' }}>
                    <div className="flex items-center justify-center gap-1.5">
                      <button title="View" onClick={() => setModal({ mode: 'view', record: u })}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-xs" style={{ background: dark, color: gold, border: `1px solid ${gold}` }}>
                        <EyeOutlined />
                      </button>
                      <button title="Edit" onClick={() => setModal({ mode: 'edit', record: u })}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-xs" style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                        <EditOutlined />
                      </button>
                      <button title="Delete" onClick={() => handleDelete(u)} disabled={deletingId === u.id}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-xs" style={{ color: '#ef4444', border: '1px solid #fecaca', background: '#fff5f5' }}>
                        {deletingId === u.id ? '·' : <DeleteOutlined />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AcademyFormModal
        open={!!modal}
        mode={modal?.mode}
        record={modal?.record}
        onClose={() => setModal(null)}
        onSaved={load}
      />
    </div>
  );
}

export default function Settings() {
  const { academy } = useAcademy() || {};
  const isSuperAdmin = academy?.role === 'super_admin';

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-16 text-sm text-gray-400">
        Only a super admin can manage academy accounts.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full">
        <h1 className="text-md sm:text-xl font-black mb-4" style={{ color: dark }}>Academy Accounts</h1>
        <AcademyManager />
      </div>
    </div>
  );
}
