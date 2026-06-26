import { useState } from 'react';
import Field, { inp } from '../common/Field';
import { MONTHS, GOLD } from '../../utils/constants';

const EMPTY = { studentId: '', month: '', year: new Date().getFullYear(), dueDate: '', amount: '' };

export default function AddFeeForm({ students, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);

  return (
    <div className="rounded-xl shadow-md p-5 mb-6" style={{ background: '#fff', border: '1px solid #C9A84C' }}>
      <h2 className="font-bold mb-4 text-sm" style={{ color: '#1a1a1a' }}>➕ Add Fee Record</h2>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(form, () => setForm(EMPTY)); }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Field label="Student *">
          <select className={inp} required value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
            <option value="">-- Select Student --</option>
            {students.map((s) => <option key={s._id} value={s._id}>{s.name} (Class {s.std})</option>)}
          </select>
        </Field>
        <Field label="Month">
          <select className={inp} value={form.month}
            onChange={(e) => setForm({ ...form, month: e.target.value })}>
            <option value="">-- Select Month --</option>
            {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="Year">
          <input type="number" className={inp} value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })} />
        </Field>
        <Field label="Due Date *">
          <input type="date" className={inp} required value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </Field>
        <Field label="Amount (Rs.) *">
          <input type="number" className={inp} required value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        </Field>
        <div className="flex items-end gap-2">
          <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold" style={GOLD}>Add</button>
          <button type="button" onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-semibold border"
            style={{ background: '#1a1a1a', color: '#C9A84C', borderColor: '#C9A84C' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
