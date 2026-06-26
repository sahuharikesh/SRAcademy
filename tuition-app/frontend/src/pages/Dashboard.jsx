import { useEffect, useState } from 'react';
import { getDashboard, getDueFees, sendWhatsApp, markFeeNotified } from '../api';
import { buildFeeMsg } from '../utils/messages';
import StatsGrid   from '../components/dashboard/StatsGrid';
import DueFeePanel from '../components/dashboard/DueFeePanel';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [dueFees, setDueFees] = useState([]);

  useEffect(() => {
    getDashboard().then(setStats).catch(() => toast.error('Failed to connect to server'));
    getDueFees().then(setDueFees);
  }, []);

  const handleSendOne = (fee) => {
    sendWhatsApp(fee.studentId.mobile, buildFeeMsg(fee));
    markFeeNotified(fee._id).catch(() => {});
    setDueFees((prev) => prev.map((f) => f._id === fee._id ? { ...f, notificationSent: true } : f));
  };

  const handleSendAll = () => {
    dueFees.forEach((fee, i) => setTimeout(() => handleSendOne(fee), i * 500));
  };

  return (
    <div className="anim-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-black" style={{ color: '#1a1a1a' }}>Dashboard</h1>
        <p className="text-xs mt-0.5 font-medium" style={{ color: '#888' }}>Welcome back — here's your academy at a glance</p>
      </div>
      <StatsGrid stats={stats} />
      <DueFeePanel dueFees={dueFees} totalDueFees={stats?.dueFees ?? 0} onSendOne={handleSendOne} onSendAll={handleSendAll} />
    </div>
  );
}
