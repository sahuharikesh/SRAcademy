import { NavLink } from 'react-router-dom';
import { DashboardOutlined, TeamOutlined, CalendarOutlined, DollarOutlined, UsergroupAddOutlined, FileTextOutlined } from '@ant-design/icons';

const links = [
  { to: '/',                label: 'Dashboard',      icon: <DashboardOutlined />    },
  { to: '/students',        label: 'Students',       icon: <TeamOutlined />         },
  { to: '/attendance',      label: 'Attendance',     icon: <CalendarOutlined />     },
  { to: '/fees',            label: 'Fees',           icon: <DollarOutlined />       },
  { to: '/groups',          label: 'Groups',         icon: <UsergroupAddOutlined /> },
  { to: '/question-paper',  label: 'Question Paper', icon: <FileTextOutlined />     },
];

const delays = [0, 75, 150, 225, 300, 375];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col flex-shrink-0"
      style={{
        width: '230px',
        background: 'linear-gradient(175deg,#0a0a0a 0%,#111 40%,#1a1a1a 100%)',
        borderRight: '2px solid #C9A84C',
      }}>

      {/* Nav links */}
      <nav className="flex flex-col gap-0.5 px-2.5 pt-4 flex-1">
        {links.map((n, i) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) =>
              `nav-item anim-slide-left flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                isActive ? 'active text-black' : 'text-gray-400 hover:text-white'
              }`
            }
            style={({ isActive }) => ({
              animationDelay: `${delays[i]}ms`,
              ...(isActive
                ? { background: 'linear-gradient(135deg,#C9A84C,#f0d080)', color: '#000', boxShadow: '0 4px 16px rgba(201,168,76,0.35)' }
                : {}),
            })}>
            <span className="text-base leading-none flex-shrink-0">{n.icon}</span>
            <span className="font-semibold">{n.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 text-center anim-fade-in"
        style={{ borderTop: '1px solid rgba(201,168,76,0.15)', animationDelay: '350ms' }}>
        <p className="text-[10px] font-semibold tracking-widest" style={{ color: 'rgba(201,168,76,0.35)' }}>
          SINCE 2016
        </p>
      </div>
    </aside>
  );
}
