import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { SettingOutlined } from '@ant-design/icons';
import { useAcademy } from '../context/AcademyContext';

const API_ORIGIN = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/api\/?$/, '');
const assetUrl = (path) => (path ? (path.startsWith('http') ? path : `${API_ORIGIN}${path}`) : '/logo.jpg');

const logout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminEmail');
  document.documentElement.style.removeProperty('--brand-gold');
  document.documentElement.style.removeProperty('--brand-dark');
  window.location.href = '/login';
};

function UserMenu() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const { academy } = useAcademy() || {};
  const email   = academy?.email || localStorage.getItem('adminEmail') || '';
  const name    = academy?.name || email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const initial = name.split(' ').map((w) => w.charAt(0)).join('').slice(0, 2);
  const isSuperAdmin = academy?.role === 'super_admin';

  return (
    <div className="hidden md:block relative">
      {/* Avatar circle — click to toggle */}
      <div
        onClick={() => setShow((v) => !v)}
        className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer select-none text-sm font-black"
        style={{ background: 'linear-gradient(135deg,var(--brand-gold, #C9A84C),color-mix(in srgb, var(--brand-gold, #C9A84C) 65%, white))', color: '#000' }}>
        {initial}
      </div>

      {/* Backdrop to close on outside click */}
      {show && (
        <div className="fixed inset-0 z-40" onClick={() => setShow(false)} />
      )}

      {/* Dropdown */}
      {show && (
        <div className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden z-50"
          style={{ width: '210px', background: 'var(--brand-dark, #1a1a1a)', border: '1.5px solid var(--brand-gold, #C9A84C)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(201,168,76,0.3)' }}>
            <p className="text-sm font-black" style={{ color: 'color-mix(in srgb, var(--brand-gold, #C9A84C) 55%, white)' }}>{name}</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.75)' }}>{email}</p>
          </div>
          {isSuperAdmin && (
            <button onClick={() => { setShow(false); navigate('/settings'); }}
              className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-left transition-all hover:bg-white/5"
              style={{ color: 'var(--brand-gold, #C9A84C)', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
              <SettingOutlined style={{ fontSize: 14 }} />
              Settings
            </button>
          )}
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-left transition-all hover:bg-red-950"
            style={{ color: '#f87171' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

const links = [
  { to: '/',                label: 'Dashboard'      },
  { to: '/students',        label: 'Students'       },
  { to: '/attendance',      label: 'Attendance'     },
  { to: '/fees',            label: 'Fees'           },
  { to: '/groups',          label: 'Groups'         },
  { to: '/question-paper',  label: 'Set Paper'      },
  { to: '/result',          label: 'Result'         },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { academy } = useAcademy() || {};
  const academyName = academy?.academyName || 'Tuition Manager';
  const logoSrc = assetUrl(academy?.logoUrl);

  return (
    <>
      <header style={{ background: 'var(--brand-dark, #1a1a1a)', borderBottom: '2px solid var(--brand-gold, #C9A84C)', position: 'relative', zIndex: 40 }}
        className="shadow-lg">

        <div className="w-full px-3 md:px-6 py-2 flex items-center justify-between">

          {/* Logo + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <img src={logoSrc} alt={academyName}
              className="w-14 h-14 rounded-full object-cover flex-shrink-0"
              style={{ border: '2px solid var(--brand-gold, #C9A84C)' }} />
            <div className="leading-none min-w-0">
              <div
                className="font-black tracking-widest text-sm sm:text-base truncate"
                style={{
                  color: 'var(--brand-gold, #C9A84C)', // fallback if background-clip:text / color-mix isn't supported
                  background: 'linear-gradient(90deg, color-mix(in srgb, var(--brand-gold, #C9A84C) 55%, white), var(--brand-gold, #C9A84C), color-mix(in srgb, var(--brand-gold, #C9A84C) 30%, white), var(--brand-gold, #C9A84C), color-mix(in srgb, var(--brand-gold, #C9A84C) 55%, white))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '0.06em',
                  fontFamily: 'Georgia, serif',
                }}>
                {academyName}
              </div>
              {academy?.academyTitle && (
                <div
                  className="font-bold text-center"
                  style={{
                    fontSize: '0.72rem',
                    color: 'rgba(255,255,255,0.85)',
                    borderTop: '1px solid rgba(201,168,76,0.4)',
                    marginTop: '3px',
                    paddingTop: '2px',
                    letterSpacing: '0.15em',
                  }}>
                  {academy.academyTitle}
                </div>
              )}
            </div>
          </div>

          {/* User Avatar (desktop) */}
          <UserMenu />

          {/* Hamburger */}
          <button className="md:hidden flex flex-col gap-1.5 p-2 z-50 relative" onClick={() => setOpen((v) => !v)}>
            <span className="block w-6 h-0.5 transition-all" style={{ background: 'var(--brand-gold, #C9A84C)', transform: open ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
            <span className="block w-6 h-0.5 transition-all" style={{ background: 'var(--brand-gold, #C9A84C)', opacity: open ? 0 : 1 }} />
            <span className="block w-6 h-0.5 transition-all" style={{ background: 'var(--brand-gold, #C9A84C)', transform: open ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
          </button>
        </div>
      </header>

      {/* Left Drawer Overlay */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpen(false)}
          style={{ background: 'rgba(0,0,0,0.5)' }} />
      )}

      {/* Left Drawer */}
      <div
        className="fixed top-0 left-0 h-full z-50 md:hidden flex flex-col"
        style={{
          width: '72vw',
          maxWidth: '280px',
          background: 'var(--brand-dark, #1a1a1a)',
          borderRight: '2px solid var(--brand-gold, #C9A84C)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          boxShadow: open ? '4px 0 24px rgba(0,0,0,0.6)' : 'none',
        }}>

        {/* Drawer Header */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(201,168,76,0.3)' }}>
          <img src={logoSrc} alt="logo" className="w-10 h-10 rounded-full object-cover" style={{ border: '2px solid var(--brand-gold, #C9A84C)' }} />
          <div className="leading-none">
            <div className="font-black" style={{ fontSize: '0.9rem', color: 'var(--brand-gold, #C9A84C)', fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}>{academyName}</div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1 px-3 pt-4 flex-1">
          {links.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive ? 'text-black' : 'text-gray-300'}`
              }
              style={({ isActive }) => isActive
                ? { background: 'linear-gradient(135deg, var(--brand-gold, #C9A84C), color-mix(in srgb, var(--brand-gold, #C9A84C) 65%, white))', color: '#000' }
                : {}}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        {/* Settings + Logout Buttons */}
        <div className="px-3 pb-2 flex flex-col gap-2">
          {academy?.role === 'super_admin' && (
            <NavLink to="/settings" onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all"
              style={{ color: 'var(--brand-gold, #C9A84C)', border: '1px solid rgba(201,168,76,0.3)' }}>
              <SettingOutlined style={{ fontSize: 16 }} />
              Settings
            </NavLink>
          )}
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:bg-red-950"
            style={{ color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Logout
          </button>
        </div>

        {/* Drawer Footer */}
        <div className="px-5 py-3 text-center" style={{ borderTop: '1px solid rgba(201,168,76,0.2)' }}>
          <p className="text-xs" style={{ color: 'rgba(201,168,76,0.5)' }}>Since 2016</p>
        </div>
      </div>
    </>
  );
}
