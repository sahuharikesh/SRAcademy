import Field, { inp } from '../common/Field';
import { STD_OPTIONS, MEDIUM_OPTIONS, GOLD, DARK } from '../../utils/constants';

export const EMPTY = {
  name: '', mobile: '', std: '', dateOfAdmission: '',
  feeType: 'Monthly', actualFees: '', recommendedFees: '', groupNo: '',
  medium: 'Hindi', schoolName: '', comment: '',
};

export default function StudentForm({ form, setForm, editId, onSubmit, onCancel, groups = [], submitting = false }) {
  const isNewGroup = form.groupNo === '__new__';

  return (
    <div className="rounded-xl shadow-md p-6 mb-6"
      style={{ background: '#fff', border: '1px solid #C9A84C' }}>
      <h2 className="text-lg font-bold mb-4" style={{ color: '#1a1a1a' }}>
        {editId ? 'Edit Student' : 'New Admission'}
      </h2>
      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Student Name *">
          <input className={inp} value={form.name} required placeholder="Full name"
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Mobile Number *">
          <input className={inp} value={form.mobile} required placeholder="10-digit mobile number"
            type="tel" inputMode="numeric" maxLength={10} pattern="[6-9][0-9]{9}"
            title="Enter a valid 10-digit Indian mobile number"
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 10);
              setForm({ ...form, mobile: val });
            }} />
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
          {isNewGroup ? (
            <div className="flex items-center gap-2">
              <span className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: '#f0f4ff', color: '#3730a3', border: '1px solid #c7d2fe' }}>
                New Group (auto-assigned on save)
              </span>
              <button type="button"
                className="px-3 py-1.5 text-xs rounded-lg border"
                style={{ background: '#f5f0e8', color: '#7a6020' }}
                onClick={() => setForm({ ...form, groupNo: '' })}>
                Clear
              </button>
            </div>
          ) : (
            <select className={inp} value={form.groupNo}
              onChange={(e) => setForm({ ...form, groupNo: e.target.value })}>
              <option value="">— No Group —</option>
              {groups.map((g) => <option key={g} value={g}>Group {g}</option>)}
              <option value="__new__">+ Create new group</option>
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
        <div className="col-span-1 sm:col-span-2 flex flex-col gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="School Name">
              <input className={inp} value={form.schoolName} placeholder="Student's school name"
                onChange={(e) => setForm({ ...form, schoolName: e.target.value })} />
            </Field>
            <Field label="Comment (Optional)">
              <input className={inp} value={form.comment} placeholder="Any notes about the student..."
                onChange={(e) => setForm({ ...form, comment: e.target.value })} />
            </Field>
          </div>
          <Field label="Medium">
            <div className="flex gap-4 flex-wrap mt-1">
              {MEDIUM_OPTIONS.map((m) => (
                <label key={m} className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
                  <input
                    type="radio"
                    name="medium"
                    value={m}
                    checked={form.medium === m}
                    onChange={() => setForm({ ...form, medium: m })}
                    className="accent-yellow-600 w-4 h-4"
                  />
                  {m}
                </label>
              ))}
            </div>
          </Field>
        </div>

        <div className="col-span-1 sm:col-span-2 flex gap-3 flex-wrap">
          <button type="submit" disabled={submitting}
            className="px-4 py-1 rounded-lg font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            style={GOLD}>
            {submitting ? 'Saving...' : (editId ? 'Update Student' : 'Admit Student')}
          </button>
          <button type="button" onClick={onCancel}
            className="px-4 py-1 rounded-lg font-semibold text-xs border"
            style={DARK}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
