import { useEffect, useState } from 'react';
import { getDashboard, getDueFees, sendWhatsApp, markFeeNotified } from '../api';
import { buildFeeMsg } from '../utils/messages';
import StatsGrid      from '../components/dashboard/StatsGrid';
import DueFeePanel    from '../components/dashboard/DueFeePanel';
import WaPreviewModal from '../components/common/WaPreviewModal';
import PageSpinner    from '../components/common/PageSpinner';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats,     setStats]     = useState(null);
  const [dueFees,   setDueFees]   = useState([]);
  const [waPreview, setWaPreview] = useState(null);
  const [loading,   setLoading]   = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, d] = await Promise.all([
        getDashboard().catch(() => { toast.error('Failed to connect to server'); return null; }),
        getDueFees().catch(() => []),
      ]);
      setStats(s);
      setDueFees(d);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSendOne = (fee) => {
    setWaPreview({ fee, msg: buildFeeMsg(fee) });
  };

  const confirmSend = () => {
    if (!waPreview) return;
    sendWhatsApp(waPreview.fee.studentId.mobile, waPreview.msg);
    markFeeNotified(waPreview.fee._id).catch(() => {});
    setDueFees((prev) => prev.map((f) => f._id === waPreview.fee._id ? { ...f, notificationSent: true } : f));
    toast.success('WhatsApp opened!');
  };

  const handleSendAll = () => {
    dueFees.forEach((fee, i) => setTimeout(() => {
      sendWhatsApp(fee.studentId.mobile, buildFeeMsg(fee));
      markFeeNotified(fee._id).catch(() => {});
    }, i * 500));
    setDueFees((prev) => prev.map((f) => ({ ...f, notificationSent: true })));
    toast.success(`Sending ${dueFees.length} WhatsApp messages...`);
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="anim-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-black" style={{ color: '#1a1a1a' }}>Dashboard</h1>
        <p className="text-xs mt-0.5 font-medium" style={{ color: '#888' }}>Welcome back — here's your academy at a glance</p>
      </div>
      <StatsGrid stats={stats} />
      <DueFeePanel dueFees={dueFees} totalDueFees={stats?.dueFees ?? 0} onSendOne={handleSendOne} onSendAll={handleSendAll} />

      <WaPreviewModal
        open={!!waPreview}
        onClose={() => setWaPreview(null)}
        title="Fee Reminder"
        subtitle={waPreview ? `${waPreview.fee.studentId?.name} — ${waPreview.fee.month} ${waPreview.fee.year}` : ''}
        message={waPreview?.msg}
        onSend={confirmSend}
      />
    </div>
  );
}
