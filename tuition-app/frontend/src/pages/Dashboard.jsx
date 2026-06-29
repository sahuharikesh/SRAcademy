import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../api';
import StatsGrid   from '../components/dashboard/StatsGrid';
import PageSpinner from '../components/common/PageSpinner';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const s = await getDashboard().catch(() => { toast.error('Failed to connect to server'); return null; });
      setStats(s);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <PageSpinner />;

  return (
    <div className="anim-fade-up">
      <div className="mb-6">
        <h1 className="text-lg font-black" style={{ color: '#1a1a1a' }}>Dashboard</h1>
        <p className="text-xs mt-0.5 font-medium" style={{ color: '#888' }}>Welcome back — here's your academy at a glance</p>
      </div>
      <StatsGrid stats={stats} onNavigate={navigate} />

      {/* Std-wise student count chart */}
      {stats?.stdWiseCount?.length > 0 && (
        <div className="mb-6 rounded-2xl p-4" style={{ background: '#fff', border: '1.5px solid #e5e7eb' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-black" style={{ color: '#1a1a1a' }}>Class-wise Students</h2>
              <p className="text-[10px] font-medium" style={{ color: '#888' }}>{stats.stdWiseCount.length} classes · {stats.totalStudents} total</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.stdWiseCount} barCategoryGap="25%" margin={{ top: 18, right: 10, left: -10, bottom: 30 }}>
              <XAxis dataKey="std" tick={{ fontSize: 11, fontWeight: 800, fill: '#111827' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} angle={-35} textAnchor="end" interval={0} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#374151' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} width={24} />
              <Tooltip
                cursor={{ fill: '#f9f5e7' }}
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="rounded-lg px-3 py-2 text-xs shadow-lg" style={{ background: '#1a1a1a', color: '#C9A84C' }}>
                      <span className="font-black">Class {payload[0].payload.std}</span>
                      <span className="ml-2 text-white">{payload[0].value} student{payload[0].value !== 1 ? 's' : ''}</span>
                    </div>
                  ) : null
                }
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} isAnimationActive={false} style={{ outline: 'none' }} tabIndex={-1}>
                <LabelList dataKey="count" position="top" style={{ fontSize: 11, fontWeight: 700, fill: '#C9A84C' }} />
                {stats.stdWiseCount.map((entry, i) => (
                  <Cell key={entry.std} fill={['#C9A84C','#3b82f6','#10b981','#f97316','#8b5cf6','#ef4444','#06b6d4','#ec4899','#84cc16','#f59e0b','#6366f1','#14b8a6'][i % 12]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
}
