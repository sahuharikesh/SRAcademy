import { useState, useEffect } from 'react';
import AppModal from '../common/AppModal';
import { WhatsAppOutlined, CheckOutlined, SendOutlined, LinkOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';

function getAcademicYear(dateStr) {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  const month = d.getMonth();
  const year  = d.getFullYear();
  const startYear = month >= 5 ? year : year - 1;
  return `June ${startYear} – April ${startYear + 1}`;
}

const storageKey = (yr) => `wa_group_added_${yr}`;

function loadAdded(yr) {
  try { return new Set(JSON.parse(localStorage.getItem(storageKey(yr)) || '[]')); }
  catch { return new Set(); }
}

function saveAdded(yr, set) {
  localStorage.setItem(storageKey(yr), JSON.stringify([...set]));
}

export default function WaGroupModal({ open, onClose, students }) {
  const [selectedYear, setSelectedYear] = useState(null);
  const [inviteLink,   setInviteLink]   = useState('');
  const [added,        setAdded]        = useState(new Set());
  const [showAll,      setShowAll]      = useState(false);
  const [seqIndex,     setSeqIndex]     = useState(null); // sequential send mode

  const byYear = students.reduce((acc, s) => {
    const yr = getAcademicYear(s.dateOfAdmission);
    if (!acc[yr]) acc[yr] = [];
    acc[yr].push(s);
    return acc;
  }, {});

  const years = Object.keys(byYear).sort((a, b) =>
    parseInt(b.split(' ')[1]) - parseInt(a.split(' ')[1])
  );

  const activeYear     = selectedYear || years[0] || '';
  const allStudents    = byYear[activeYear] || [];
  const pendingStudents = allStudents.filter((s) => !added.has(s._id));
  const visibleStudents = showAll ? allStudents : pendingStudents;

  // Load added set when active year changes
  useEffect(() => {
    setAdded(loadAdded(activeYear));
    setShowAll(false);
  }, [activeYear]);

  const markAdded = (ids) => {
    setAdded((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      saveAdded(activeYear, next);
      return next;
    });
  };

  const buildMsg = (name) =>
    `Hello ${name}! 🙏\n\nYou are invited to join our *Shree Ram Academy* WhatsApp group for *${activeYear}*.\n\nClick the link below to join:\n${inviteLink}`;

  const handleSendOne = (s) => {
    if (!inviteLink.trim()) { toast.error('Paste the WhatsApp group invite link first'); return; }
    window.open(`https://wa.me/${s.mobile.replace(/\D/g, '')}?text=${encodeURIComponent(buildMsg(s.name))}`, '_blank');
    markAdded([s._id]);
  };

  const handleSendAll = () => {
    if (!inviteLink.trim()) { toast.error('Paste the WhatsApp group invite link first'); return; }
    if (pendingStudents.length === 0) { toast('All students already added!'); return; }
    setSeqIndex(0);
  };

  const handleSeqSend = () => {
    const s = pendingStudents[seqIndex];
    window.open(`https://wa.me/${s.mobile.replace(/\D/g, '')}?text=${encodeURIComponent(buildMsg(s.name))}`, '_blank');
    markAdded([s._id]);
    if (seqIndex + 1 < pendingStudents.length) {
      setSeqIndex(seqIndex + 1);
    } else {
      setSeqIndex(null);
      toast.success('All invites sent!');
    }
  };

  const handleSeqSkip = () => {
    if (seqIndex + 1 < pendingStudents.length) setSeqIndex(seqIndex + 1);
    else { setSeqIndex(null); toast('Done!'); }
  };

  const handleReset = () => {
    localStorage.removeItem(storageKey(activeYear));
    setAdded(new Set());
    toast.success('Reset — all students visible again');
  };

  return (
    <AppModal open={open} onClose={onClose} title="Send Group Invite"
      subtitle="Paste your WhatsApp group link and send to students" width={520}>
      <div className="px-5 py-4 flex flex-col gap-4">

        {/* Academic year tabs */}
        <div className="flex flex-wrap gap-2">
          {years.map((yr) => {
            const pending = (byYear[yr] || []).filter((s) => !loadAdded(yr).has(s._id)).length;
            return (
              <button key={yr} onClick={() => setSelectedYear(yr)}
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={activeYear === yr
                  ? { background: '#1a1a1a', color: '#C9A84C', border: '1.5px solid #C9A84C' }
                  : { background: '#f3f4f6', color: '#374151', border: '1.5px solid #e5e7eb' }}>
                {yr}
                <span className="ml-1.5" style={{ color: activeYear === yr ? '#C9A84C' : pending > 0 ? '#dc2626' : '#15803d' }}>
                  ({pending > 0 ? `${pending} pending` : 'all added'})
                </span>
              </button>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="rounded-lg px-4 py-2.5 text-xs leading-relaxed"
          style={{ background: '#fffbeb', border: '1px solid #fcd34d', color: '#92400e' }}>
          <strong>Steps:</strong> Create WhatsApp group → tap group name → Invite via link → Copy → paste below → Send
        </div>

        {/* Invite link input */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ border: '1.5px solid #C9A84C', background: '#fffdf5' }}>
          <LinkOutlined style={{ color: '#C9A84C', flexShrink: 0 }} />
          <input value={inviteLink} onChange={(e) => setInviteLink(e.target.value)}
            placeholder="Paste WhatsApp group invite link…"
            className="flex-1 text-xs outline-none bg-transparent" style={{ color: '#1a1a1a' }} />
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-500">
              <span className="font-semibold text-green-600">{added.size}</span> added &nbsp;·&nbsp;
              <span className="font-semibold text-red-500">{pendingStudents.length}</span> pending
            </span>
            {added.size > 0 && (
              <button onClick={() => setShowAll((v) => !v)}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>
                <EyeOutlined /> {showAll ? 'Hide added' : 'Show all'}
              </button>
            )}
            {added.size > 0 && (
              <button onClick={handleReset}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}>
                <ReloadOutlined /> Reset
              </button>
            )}
          </div>
          <button onClick={handleSendAll} disabled={pendingStudents.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black"
            style={pendingStudents.length === 0
              ? { background: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' }
              : { background: 'linear-gradient(135deg,#25D366,#1ead52)', color: '#fff' }}>
            <SendOutlined /> Send to All ({pendingStudents.length})
          </button>
        </div>

        {/* Sequential send overlay */}
        {seqIndex !== null && (
          <div className="rounded-xl p-4 flex flex-col gap-3"
            style={{ background: '#f0fdf4', border: '2px solid #25D366' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-green-700">
                Sending {seqIndex + 1} of {pendingStudents.length}
              </span>
              <button onClick={() => setSeqIndex(null)}
                className="text-xs px-2 py-0.5 rounded" style={{ background: '#fee2e2', color: '#dc2626' }}>
                Cancel
              </button>
            </div>
            <div className="rounded-lg px-3 py-2" style={{ background: '#fff', border: '1px solid #86efac' }}>
              <p className="text-sm font-black" style={{ color: '#1a1a1a' }}>{pendingStudents[seqIndex]?.name}</p>
              <p className="text-xs text-gray-500">{pendingStudents[seqIndex]?.mobile} &nbsp;·&nbsp; Class {pendingStudents[seqIndex]?.std}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSeqSend}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black"
                style={{ background: 'linear-gradient(135deg,#25D366,#1ead52)', color: '#fff' }}>
                <WhatsAppOutlined /> Tap to Send
              </button>
              <button onClick={handleSeqSkip}
                className="px-4 py-2.5 rounded-xl text-xs font-bold"
                style={{ background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' }}>
                Skip
              </button>
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ background: '#dcfce7', height: 6 }}>
              <div className="h-full rounded-full transition-all" style={{ background: '#25D366', width: `${(seqIndex / pendingStudents.length) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Student list */}
        <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1">
          {visibleStudents.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm font-semibold text-green-600">All students added to group!</p>
              <p className="text-xs text-gray-400 mt-1">New admissions will appear here automatically</p>
            </div>
          ) : (
            visibleStudents.map((s) => {
              const isAdded = added.has(s._id);
              return (
                <div key={s._id} className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ background: isAdded ? '#f0fdf4' : '#fff',
                    border: `1px solid ${isAdded ? '#86efac' : '#e5e7eb'}`,
                    opacity: isAdded ? 0.7 : 1 }}>
                  <div>
                    <span className="text-sm font-semibold" style={{ color: isAdded ? '#15803d' : '#1a1a1a' }}>
                      {s.name}
                    </span>
                    {isAdded && <span className="ml-2 text-xs text-green-600 font-semibold">✓ Added</span>}
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold"
                      style={{ background: '#fff3cd', color: '#856404' }}>{s.std}</span>
                    {s.groupNo && (
                      <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ background: '#1a1a1a', color: '#C9A84C' }}>{s.groupNo}</span>
                    )}
                    <div className="text-xs text-gray-500 mt-0.5">{s.mobile}</div>
                  </div>
                  <button onClick={() => handleSendOne(s)} title={isAdded ? 'Send again' : 'Send invite'}
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={isAdded
                      ? { background: '#d4edda', color: '#155724' }
                      : { background: 'linear-gradient(135deg,#25D366,#1ead52)', color: '#fff' }}>
                    {isAdded ? <CheckOutlined /> : <WhatsAppOutlined />}
                  </button>
                </div>
              );
            })
          )}
        </div>

      </div>
      <div className="px-5 pb-5">
        <button onClick={onClose} className="w-full py-2 rounded-lg text-xs font-black"
          style={{ background: '#f3f4f6', color: '#374151' }}>Close</button>
      </div>
    </AppModal>
  );
}
