import StatCard from '../common/StatCard';
import { TeamOutlined, DollarOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const delays = [0, 75, 150, 225];

export default function StatsGrid({ stats, onNavigate }) {
  const cards = [
    { label: 'Total Students',  value: stats?.totalStudents ?? '...', variant: 'blue',  icon: <TeamOutlined />,          to: '/students'   },
    { label: 'Fees Due',        value: stats?.dueFees       ?? '...', variant: 'gold',  icon: <DollarOutlined />,        to: '/fees'       },
    { label: "Today's Present", value: stats?.todayPresent  ?? '...', variant: 'green', icon: <CheckCircleOutlined />,   to: '/attendance' },
    { label: "Today's Absent",  value: stats?.todayAbsent   ?? '...', variant: 'red',   icon: <CloseCircleOutlined />,   to: '/attendance' },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 mb-4 sm:gap-3 sm:mb-6 md:grid-cols-4">
      {cards.map((c, i) => (
        <div key={c.label} className="anim-scale-in cursor-pointer" style={{ animationDelay: `${delays[i]}ms` }}
          onClick={() => onNavigate?.(c.to)}>
          <StatCard {...c} />
        </div>
      ))}
    </div>
  );
}
