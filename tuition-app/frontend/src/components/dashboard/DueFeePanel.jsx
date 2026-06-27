import { useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import { GOLD, DARK } from '../../utils/constants';
import { WhatsAppOutlined, PhoneOutlined, WarningOutlined, BellOutlined, ClockCircleOutlined, CloseCircleOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

const today = new Date(); today.setHours(0, 0, 0, 0);

export default function DueFeePanel({ dueFees, totalDueFees, onSendOne, onSendAll }) {
  const [show, setShow] = useState(true);
  const overdue  = dueFees.filter((f) => f.status === 'Overdue');
  const upcoming = dueFees.filter((f) => f.status === 'Upcoming');
  const pending  = dueFees.filter((f) => f.status === 'Pending');

  if (dueFees.length === 0) return (
    totalDueFees === 0
      ? <div className="rounded-xl p-6 text-center font-medium"
          style={{ background: '#f0fff4', border: '1px solid #b7ebc8', color: '#155724' }}>
          All fees are cleared! Nothing is due.
        </div>
      : <div className="rounded-xl p-6 text-center font-medium"
          style={{ background: '#fffdf0', border: '1px solid #ffe082', color: '#856404' }}>
          <BellOutlined className="mr-1" /> {totalDueFees} fee(s) due or overdue — none upcoming within 7 days.
        </div>
  );

  return (
    <div className="anim-fade-up rounded-2xl shadow-md overflow-hidden"
      style={{ background: '#fff', border: '1px solid #C9A84C', animationDelay: '200ms' }}>

      {/* Panel header */}
      <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3"
        style={{ background: 'linear-gradient(135deg,#1a1a1a,#2a2a2a)', borderBottom: '2px solid #C9A84C' }}>
        <div>
          <h2 className="text-base font-black text-white"><WarningOutlined className="mr-1" />{dueFees.length} Student(s) — Fees Alert</h2>
          <p className="text-[11px] mt-0.5 font-medium" style={{ color: 'rgba(201,168,76,0.8)' }}>Action required on pending / overdue payments</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onSendAll} title="Send All WhatsApp"
            className="btn-shine px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1" style={GOLD}>
            <WhatsAppOutlined /> Send All
          </button>
          <button onClick={() => setShow((v) => !v)} title={show ? 'Hide' : 'Show'}
            className="w-7 h-7 rounded-lg font-bold border flex items-center justify-center" style={DARK}>
            {show ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">

      <div className="flex gap-3 text-xs flex-wrap">
        {overdue.length > 0 && (
          <span className="px-3 py-1 rounded-full font-semibold" style={{ background: '#f8d7da', color: '#721c24' }}>
            <CloseCircleOutlined className="mr-1" />{overdue.length} Overdue
          </span>
        )}
        {pending.length > 0 && (
          <span className="px-3 py-1 rounded-full font-semibold" style={{ background: '#e2e3e5', color: '#383d41' }}>
            <ClockCircleOutlined className="mr-1" />{pending.length} Due Today
          </span>
        )}
        {upcoming.length > 0 && (
          <span className="px-3 py-1 rounded-full font-semibold" style={{ background: '#fff3cd', color: '#856404' }}>
            <BellOutlined className="mr-1" />{upcoming.length} Upcoming (within 7 days)
          </span>
        )}
      </div>

      {show && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: '#1a1a1a' }}>
                {['Student','Class','Mobile','Month','Amount','Due Date','Status','Actions'].map((h) => (
                  <th key={h} className="p-2 text-left text-xs font-semibold" style={{ color: '#C9A84C' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dueFees.map((fee, i) => (
                <tr key={fee._id} className="tr-anim border-b"
                  style={{
                    animationDelay: `${Math.min(i * 40, 300)}ms`,
                    background: fee.status === 'Overdue' ? '#fff5f5'
                      : fee.status === 'Upcoming' ? '#fffdf0'
                      : '#fff'
                  }}>
                  <td className="p-2 font-medium">{fee.studentId?.name}</td>
                  <td className="p-2">{fee.studentId?.std}</td>
                  <td className="p-2">{fee.studentId?.mobile}</td>
                  <td className="p-2">{fee.month} {fee.year}</td>
                  <td className="p-2">₹{fee.amount}</td>
                  <td className="p-2">
                    {new Date(fee.dueDate).toLocaleDateString('en-IN')}
                    {fee.status === 'Upcoming' && (
                      <span className="ml-1 text-xs font-medium" style={{ color: '#856404' }}>
                        ({Math.ceil((new Date(fee.dueDate) - today) / 86400000)}d left)
                      </span>
                    )}
                  </td>
                  <td className="p-2"><StatusBadge status={fee.status} /></td>
                  <td className="p-2">
                    <div className="flex gap-1.5">
                      <button onClick={() => onSendOne(fee)} title={fee.notificationSent ? 'WhatsApp sent' : 'Send WhatsApp'}
                        className="w-7 h-7 rounded flex items-center justify-center"
                        style={fee.notificationSent ? { background: '#e2e3e5', color: '#666' } : GOLD}>
                        <WhatsAppOutlined />
                      </button>
                      <a href={`tel:${fee.studentId?.mobile}`} title="Call"
                        onClick={(e) => e.stopPropagation()}
                        className="w-7 h-7 rounded flex items-center justify-center"
                        style={{ background: '#d4edda', color: '#155724' }}>
                        <PhoneOutlined />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
}
