import { useState } from 'react';
import Field, { inp } from '../common/Field';
import { STD_OPTIONS, GOLD, DARK } from '../../utils/constants';

export const EMPTY = {
  name: '', mobile: '', std: '', dateOfAdmission: '',
  feeType: 'Monthly', actualFees: '', recommendedFees: '', groupNo: '',
};

export default function StudentForm({ form, setForm, editId, onSubmit, onCancel, groups = [] }) {
  const [newGroup, setNewGroup] = useState(false);

  return (
    <div className="rounded-xl shadow-md p-6 mb-6"
      style={{ background: '#fff', border: '1px solid #C9A84C' }}>
      <h2 className="text-lg font-bold mb-4" style={{ color: '#1a1a1a' }}>
        {editId ? '✏️ Edit Student' : '🎓 New Admission'}
      </h2>
      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Student Name *">
          <input className={inp} value={form.name} required placeholder="Full name"
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Mobile Number *">
          <input className={inp} value={form.mobile} required placeholder="Parent's mobile number"
            onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
        </Field>
        <Field label="Class / Standard *">
          <select className={inp} value={form.std} required
            onChange={(e) => setForm({ ...form, std: e.target.value })}>
            <option value="">-- Select Class --</option>
            {STD_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Date of Admission *">
          <input type="date" className={inp} value={form.dateOfAdmission} required
            onChange={(e) => setForm({ ...form, dateOfAdmission: e.target.value })} />
        </Field>
        <Field label="Fee Type *">
          <select className={inp} value={form.feeType}
            onChange={(e) => setForm({ ...form, feeType: e.target.value })}>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </Field>
        <Field label="Group No (Family)">
          {newGroup ? (
            <div className="flex gap-2">
              <input className={inp} autoFocus value={form.groupNo}
                placeholder="Enter group name e.g. G3"
                onChange={(e) => setForm({ ...form, groupNo: e.target.value })} />
              <button type="button"
                className="px-3 py-1.5 text-xs rounded-lg border"
                style={{ background: '#f5f0e8', color: '#7a6020' }}
                onClick={() => { setNewGroup(false); setForm({ ...form, groupNo: '' }); }}>
                Cancel
              </button>
            </div>
          ) : (
            <select className={inp} value={form.groupNo}
              onChange={(e) => {
                if (e.target.value === '__new__') { setNewGroup(true); setForm({ ...form, groupNo: '' }); }
                else setForm({ ...form, groupNo: e.target.value });
              }}>
              <option value="">— No Group —</option>
              {groups.map((g) => <option key={g} value={g}>Group {g}</option>)}
              <option value="__new__">+ Create New Group</option>
            </select>
          )}
        </Field>
        <Field label="My Rate (Rs.) *">
          <input type="number" className={inp} value={form.actualFees} required placeholder="Your standard rate"
            onChange={(e) => setForm({ ...form, actualFees: e.target.value })} />
        </Field>
        <Field label="Final Fees — Agreed with Family (Rs.) *">
          <input type="number" className={inp} value={form.recommendedFees} required placeholder="Final agreed amount"
            onChange={(e) => setForm({ ...form, recommendedFees: e.target.value })} />
        </Field>

        <div className="col-span-1 sm:col-span-2 flex gap-3 flex-wrap">
          <button type="submit" className="px-6 py-2 rounded-lg font-semibold text-sm" style={GOLD}>
            {editId ? 'Update Student' : 'Admit Student'}
          </button>
          <button type="button" onClick={onCancel}
            className="px-6 py-2 rounded-lg font-semibold text-sm border"
            style={DARK}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
