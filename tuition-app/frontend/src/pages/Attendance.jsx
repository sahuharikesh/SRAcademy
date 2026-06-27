import { useEffect, useState } from 'react';
import { getAttendance, saveAttendance, sendWhatsApp, markAttendanceNotified, getMonthlyAttendance, getStudents } from '../api';
import { MONTHS } from '../utils/constants';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, TeamOutlined, SendOutlined, WhatsAppOutlined } from '@ant-design/icons';
import AppModal from '../components/common/AppModal';
import PageSpinner from '../components/common/PageSpinner';
import WaPreviewModal from '../components/common/WaPreviewModal';
import AttendanceControls from '../components/attendance/AttendanceControls';
import AttendanceTable    from '../components/attendance/AttendanceTable';
import AbsentNotifyPanel  from '../components/attendance/AbsentNotifyPanel';
import StatCard           from '../components/common/StatCard';
import toast from 'react-hot-toast';

const today = new Date().toISOString().split('T')[0];

export default function Attendance() {
  const [tab, setTab] = useState('daily');

  // ── Daily state ──
  const [date,    setDate]    = useState(today);
  const [data,    setData]    = useState([]);
  const [marks,   setMarks]   = useState({});
  const [loading,     setLoading]     = useState(true);
  const [pageReady,   setPageReady]   = useState(false);

  // ── Monthly state ──
  const now = new Date();
  const [month,       setMonth]       = useState(now.getMonth() + 1);
  const [year,        setYear]        = useState(now.getFullYear());
  const [monthlyData, setMonthlyData] = useState([]);
  const [mLoading,    setMLoading]    = useState(false);
  const [searched,    setSearched]    = useState(false);

  // ── WA preview state ──
  const [waPreview, setWaPreview] = useState(null); // { row, msg }

  // ── Modal state ──
  const [showModal,   setShowModal]   = useState(false);
  const [filterStd,   setFilterStd]   = useState('');
  const [filterName,  setFilterName]  = useState('');
  const [allStudents, setAllStudents] = useState([]);
  const [modalStep,   setModalStep]   = useState(1); // 1=pick std, 2=pick student

  // ── Daily logic ──
  const load = async (d) => {
    setLoading(true);
    try {
      const rows = await getAttendance(d);
      setData(rows);
      const m = {};
      rows.forEach((r) => { m[r.student._id] = r.attendance?.status || 'Present'; });
      setMarks(m);
    } catch { toast.error('Failed to load attendance'); }
    setLoading(false);
    setPageReady(true);
  };

  useEffect(() => { load(date); }, [date]);

  const handleMark   = (id, status) => setMarks((m) => ({ ...m, [id]: status }));
  const handleSetAll = (status) => { const m = {}; data.forEach((r) => { m[r.student._id] = status; }); setMarks(m); };
  const handleSave   = async () => {
    const records = Object.entries(marks).map(([studentId, status]) => ({ studentId, status }));
    try { await saveAttendance(date, records); toast.success('Attendance saved!'); load(date); }
    catch { toast.error('Failed to save attendance'); }
  };

  const buildAbsentMsg = (row) => {
    const s = row.student;
    const dateStr = new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return (
      `*Shree Ram Academy*\n` +
      `*--------------------*\n` +
      `*Absence Alert*\n\n` +
      `Dear Parent of *${s.name}*,\n\n` +
      `We noticed that your child was *absent* today.\n\n` +
      `Student : ${s.name}\n` +
      `Class    : ${s.std}\n` +
      `Date     : ${dateStr}\n` +
      `Status   : *Absent*\n\n` +
      `_If this is due to illness or any reason, please inform us._\n\n` +
      `Contact us for more information.\n` +
      `-- *Shree Ram Academy*`
    );
  };

  const handleSendOne = (row) => {
    setWaPreview({ row, msg: buildAbsentMsg(row) });
  };

  const confirmAbsentSend = () => {
    if (!waPreview) return;
    sendWhatsApp(waPreview.row.student.mobile, waPreview.msg);
    if (waPreview.row.attendance?._id) markAttendanceNotified(waPreview.row.attendance._id).catch(() => {});
    toast.success('WhatsApp opened!');
  };

  const handleSendAll = () => {
    if (absentList.length === 0) return toast.error('No absent students!');
    absentList.forEach((row, i) => setTimeout(() => {
      sendWhatsApp(row.student.mobile, buildAbsentMsg(row));
      if (row.attendance?._id) markAttendanceNotified(row.attendance._id).catch(() => {});
    }, i * 600));
    toast.success(`Sending ${absentList.length} WhatsApp messages...`);
  };

  const absentList = data.filter((r) => marks[r.student._id] === 'Absent');
  const stats = {
    present: Object.values(marks).filter((v) => v === 'Present').length,
    absent:  Object.values(marks).filter((v) => v === 'Absent').length,
    late:    Object.values(marks).filter((v) => v === 'Late').length,
  };

  // ── Monthly logic ──
  const loadMonthly = async (m = month, y = year) => {
    setMLoading(true);
    try {
      const res = await getMonthlyAttendance(m, y);
      setMonthlyData(res);
    } catch { toast.error('Failed to load monthly report'); }
    setMLoading(false);
  };

  const openModal = async () => {
    setModalStep(1);
    setFilterStd('');
    setFilterName('');
    setShowModal(true);
    if (allStudents.length === 0) {
      try { setAllStudents(await getStudents()); } catch {}
    }
  };

  const handleTabMonthly = () => {
    setTab('monthly');
    setSearched(false);
    setMonthlyData([]);
    openModal();
  };

  const handleModalSearch = () => {
    setShowModal(false);
    setSearched(true);
    loadMonthly();
  };

  const handleCancel = () => {
    setShowModal(false);
    if (!searched) setTab('daily');
  };

  // unique sorted stds
  const stdOptions = [...new Set(allStudents.map((s) => s.std))].sort();
  // students filtered by selected std
  const studentOptions = allStudents.filter((s) => s.std === filterStd);

  // filtered results
  const filteredData = monthlyData.filter((row) => {
    const nameMatch = !filterName.trim() || row.student.name.toLowerCase().includes(filterName.trim().toLowerCase());
    const stdMatch  = !filterStd.trim()  || row.student.std.toLowerCase().includes(filterStd.trim().toLowerCase());
    return nameMatch && stdMatch;
  });

  const buildMonthlyMsg = (row) => {
    const s = row.student;
    const monthName = MONTHS[month - 1];
    const absentDays = (row.absentDates || [])
      .map((d) => new Date(d).getDate())
      .sort((a, b) => a - b)
      .map((d) => `${String(d).padStart(2, '0')} ${monthName.slice(0, 3)}`)
      .join(', ');

    return (
      `*Shree Ram Academy*\n` +
      `*--------------------*\n` +
      `*Monthly Attendance Report*\n\n` +
      `Dear Parent of *${s.name}*,\n\n` +
      `Here is the attendance summary for *${monthName} ${year}*:\n\n` +
      `Student : ${s.name}\n` +
      `Class    : ${s.std}\n\n` +
      `Present : *${row.totalPresent} days*\n` +
      `Absent  : *${row.totalAbsent} days*\n` +
      (row.totalLate > 0 ? `Late    : *${row.totalLate} days*\n` : '') +
      (row.totalAbsent > 0 ? `\n*Absent Dates:*\n${absentDays}\n` : '\nNo absences this month!\n') +
      `\n_Please ensure regular attendance for better performance._\n\n` +
      `Contact us for any queries.\n` +
      `-- *Shree Ram Academy*`
    );
  };

  const handleSendMonthlyOne = (row) => {
    if (!row.student.mobile) return toast.error(`No mobile number for ${row.student.name}`);
    sendWhatsApp(row.student.mobile, buildMonthlyMsg(row));
  };

  const handleSendMonthlyAll = () => {
    if (filteredData.length === 0) return toast.error('No students to notify');
    filteredData.forEach((row, i) => setTimeout(() => handleSendMonthlyOne(row), i * 600));
    toast.success(`Sending report to ${filteredData.length} parents...`);
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const buildDayMap = (row) => {
    const map = {};
    (row.presentDates || []).forEach((d) => { map[new Date(d).getDate()] = 'P'; });
    (row.lateDates    || []).forEach((d) => { map[new Date(d).getDate()] = 'L'; });
    (row.absentDates  || []).forEach((d) => { map[new Date(d).getDate()] = 'A'; });
    return map;
  };

  const totalAbsent  = filteredData.reduce((s, r) => s + r.totalAbsent, 0);
  const totalPresent = filteredData.reduce((s, r) => s + r.totalPresent, 0);

  if (!pageReady) return <PageSpinner />;

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setTab('daily')}
          className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all"
          style={tab === 'daily'
            ? { background: 'linear-gradient(135deg,#C9A84C,#f0d080)', color: '#000' }
            : { background: '#1a1a1a', color: '#888', border: '1px solid #333' }}
        >Daily Attendance</button>
        <button
          onClick={handleTabMonthly}
          className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all"
          style={tab === 'monthly'
            ? { background: 'linear-gradient(135deg,#C9A84C,#f0d080)', color: '#000' }
            : { background: '#1a1a1a', color: '#888', border: '1px solid #333' }}
        >Monthly Report</button>
      </div>

      {/* ── DAILY TAB ── */}
      {tab === 'daily' && (
        <>
          <AttendanceControls date={date} onDateChange={setDate} onSetAll={handleSetAll} onSave={handleSave} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 sm:gap-3 sm:mb-6">
            <StatCard label="Present" value={stats.present} variant="green"  icon={<CheckCircleOutlined />} />
            <StatCard label="Absent"  value={stats.absent}  variant="red"    icon={<CloseCircleOutlined />} />
            <StatCard label="Late"    value={stats.late}    variant="purple" icon={<ClockCircleOutlined />} />
          </div>
          <AttendanceTable data={data} marks={marks} onMark={handleMark} loading={loading} />
          <AbsentNotifyPanel absentList={absentList} onSendOne={handleSendOne} onSendAll={handleSendAll} />
        </>
      )}

      {/* ── MONTHLY TAB ── */}
      {tab === 'monthly' && searched && (
        <>
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {filterStd  && <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: '#1a1a1a', color: '#C9A84C', border: '1px solid #C9A84C' }}>Class: {filterStd}</span>}
              {filterName && <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: '#1a1a1a', color: '#C9A84C', border: '1px solid #C9A84C' }}>Name: {filterName}</span>}
              <button onClick={() => setShowModal(true)}
                className="text-xs font-semibold px-3 py-1 rounded-full underline"
                style={{ color: '#888' }}>Change Filter</button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select value={month} onChange={(e) => { const m = Number(e.target.value); setMonth(m); loadMonthly(m, year); }}
                className="text-xs font-semibold rounded-lg px-2 py-1 outline-none"
                style={{ background: '#1a1a1a', color: '#C9A84C', border: '1px solid #C9A84C' }}>
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
              <select value={year} onChange={(e) => { const y = Number(e.target.value); setYear(y); loadMonthly(month, y); }}
                className="text-xs font-semibold rounded-lg px-2 py-1 outline-none"
                style={{ background: '#1a1a1a', color: '#C9A84C', border: '1px solid #C9A84C' }}>
                {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <button onClick={handleSendMonthlyAll}
                className="px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1.5"
                style={{ background: 'linear-gradient(135deg,#25D366,#1ead52)', color: '#fff' }}>
                <SendOutlined className="mr-1" />Send All
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-2 mb-4 sm:gap-3 sm:mb-5">
            <StatCard label="Students"      value={filteredData.length} variant="blue"  icon={<TeamOutlined />}          />
            <StatCard label="Total Present" value={totalPresent}        variant="green" icon={<CheckCircleOutlined />}   />
            <StatCard label="Total Absent"  value={totalAbsent}         variant="red"   icon={<CloseCircleOutlined />}   />
          </div>

          {mLoading ? (
            <div className="text-center py-16 text-gray-400 text-sm">Loading...</div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">No students found matching your search.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredData.map((row) => {
                const dayMap     = buildDayMap(row);
                const absentDays = Object.entries(dayMap).filter(([, v]) => v === 'A').map(([k]) => Number(k)).sort((a, b) => a - b);
                return (
                  <div key={row.student._id} className="rounded-xl overflow-hidden"
                    style={{ background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>

                    {/* Student header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3"
                      style={{ background: 'linear-gradient(135deg,#1a1a1a,#2a2a2a)', borderBottom: '2px solid #C9A84C' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                          style={{ background: '#C9A84C', color: '#000' }}>
                          {row.student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{row.student.name}</div>
                          <div className="text-xs" style={{ color: '#C9A84C' }}>Class {row.student.std} · Group {row.student.groupNo}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(77,217,122,0.15)', color: '#4DD97A', border: '1px solid rgba(77,217,122,0.3)' }}>
                          {row.totalPresent} Present
                        </span>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(245,101,101,0.15)', color: '#F56565', border: '1px solid rgba(245,101,101,0.3)' }}>
                          {row.totalAbsent} Absent
                        </span>
                        {row.totalLate > 0 && (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                            style={{ background: 'rgba(245,200,66,0.15)', color: '#F5C842', border: '1px solid rgba(245,200,66,0.3)' }}>
                            {row.totalLate} Late
                          </span>
                        )}
                        <button
                          onClick={() => handleSendMonthlyOne(row)}
                          className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background: '#25D366', color: '#fff' }}>
                          <WhatsAppOutlined />
                        </button>
                      </div>
                    </div>

                    {/* Absent date chips */}
                    <div className="px-4 py-3">
                      {absentDays.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No absents this month</p>
                      ) : (
                        <>
                          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Absent Dates</p>
                          <div className="flex flex-wrap gap-1.5">
                            {absentDays.map((d) => (
                              <span key={d} className="text-xs font-bold px-2.5 py-1 rounded-lg"
                                style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}>
                                {String(d).padStart(2, '0')} {MONTHS[month - 1].slice(0, 3)}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Day grid */}
                    <div className="px-4 pb-4">
                      <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Day View</p>
                      <div className="flex flex-wrap gap-1">
                        {days.map((d) => {
                          const status = dayMap[d]; // 'P' | 'L' | 'A' | undefined
                          const style =
                            status === 'A' ? { background: '#DC2626', color: '#fff' } :
                            status === 'L' ? { background: '#F59E0B', color: '#fff' } :
                            status === 'P' ? { background: '#D1FAE5', color: '#065F46' } :
                                             { background: '#F3F4F6', color: '#9CA3AF' };
                          const label =
                            status === 'A' ? 'Absent' :
                            status === 'L' ? 'Late' :
                            status === 'P' ? 'Present' : 'Not marked';
                          return (
                            <div key={d}
                              title={`Day ${d}: ${label}`}
                              className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold"
                              style={style}>
                              {d}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 text-[10px] text-gray-400">
                          <span className="w-3 h-3 rounded inline-block" style={{ background: '#DC2626' }} /> Absent
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-400">
                          <span className="w-3 h-3 rounded inline-block" style={{ background: '#F59E0B' }} /> Late
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-400">
                          <span className="w-3 h-3 rounded inline-block" style={{ background: '#D1FAE5', border: '1px solid #6EE7B7' }} /> Present
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-400">
                          <span className="w-3 h-3 rounded inline-block" style={{ background: '#F3F4F6' }} /> Not marked
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <WaPreviewModal
        open={!!waPreview}
        onClose={() => setWaPreview(null)}
        title="Absence Alert"
        subtitle={waPreview ? `${waPreview.row.student.name} — ${waPreview.row.student.mobile}` : ''}
        message={waPreview?.msg}
        onSend={confirmAbsentSend}
      />

      {/* ── SEARCH MODAL ── */}
      <AppModal open={showModal} onClose={handleCancel} title="Monthly Report" subtitle="Select month, class and student">
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Month</label>
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-lg text-xs font-semibold outline-none"
                style={{ border: '1.5px solid #C9A84C', background: '#fafaf8', color: '#1a1a1a' }}>
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div className="w-24">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Year</label>
              <select value={year} onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-lg text-xs font-semibold outline-none"
                style={{ border: '1.5px solid #C9A84C', background: '#fafaf8', color: '#1a1a1a' }}>
                {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Class (Std)</label>
            <select value={filterStd}
              onChange={(e) => { setFilterStd(e.target.value); setFilterName(''); }}
              className="w-full px-2 py-1.5 rounded-lg text-xs font-semibold outline-none"
              style={{ border: '1.5px solid #C9A84C', background: '#fafaf8', color: '#1a1a1a' }}>
              <option value="">-- All Classes --</option>
              {stdOptions.map((s) => <option key={s} value={s}>Class {s}</option>)}
            </select>
          </div>

          {filterStd && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Student</label>
              <select value={filterName} onChange={(e) => setFilterName(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg text-xs font-semibold outline-none"
                style={{ border: '1.5px solid #C9A84C', background: '#fafaf8', color: '#1a1a1a' }}>
                <option value="">-- All Students of Class {filterStd} --</option>
                {studentOptions.map((s) => <option key={s._id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="px-6 pb-5 flex gap-3">
          <button onClick={handleCancel}
            className="flex-1 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: '#f3f4f6', color: '#666' }}>Cancel</button>
          <button onClick={handleModalSearch}
            className="flex-1 py-1.5 rounded-lg text-xs font-black"
            style={{ background: 'linear-gradient(135deg,#C9A84C,#f0d080)', color: '#000' }}>
            Search
          </button>
        </div>
      </AppModal>
    </div>
  );
}
