import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const logout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminEmail');
  window.location.href = '/login';
};

function UserMenu() {
  const [show, setShow] = useState(false);
  const email   = localStorage.getItem('adminEmail') || '';
  const name    = email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const initial = name.split(' ').map((w) => w.charAt(0)).join('').slice(0, 2);

  return (
    <div className="hidden md:block relative">
      {/* Avatar circle — click to toggle */}
      <div
        onClick={() => setShow((v) => !v)}
        className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer select-none text-sm font-black"
        style={{ background: 'linear-gradient(135deg,#C9A84C,#f0d080)', color: '#000' }}>
        {initial}
      </div>

      {/* Backdrop to close on outside click */}
      {show && (
        <div className="fixed inset-0 z-40" onClick={() => setShow(false)} />
      )}

      {/* Dropdown */}
      {show && (
        <div className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden z-50"
          style={{ width: '210px', background: '#1a1a1a', border: '1.5px solid #C9A84C', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(201,168,76,0.3)' }}>
            <p className="text-sm font-black" style={{ color: '#FFD700' }}>{name}</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.75)' }}>{email}</p>
          </div>
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
  { to: '/',           label: 'Dashboard'  },
  { to: '/students',   label: 'Students'   },
  { to: '/attendance', label: 'Attendance' },
  { to: '/fees',       label: 'Fees'       },
  { to: '/groups',     label: 'Groups'     },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)', borderBottom: '2px solid #C9A84C', position: 'relative', zIndex: 40 }}
        className="shadow-lg">

        <div className="w-full px-3 md:px-6 py-2 flex items-center justify-between">

          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Shree Ram Academy"
              className="w-14 h-14 rounded-full object-cover"
              style={{ border: '2px solid #C9A84C' }} />
            <div className="leading-none">
              <div
                className="font-black tracking-widest"
                style={{
                  fontSize: '1.05rem',
                  background: 'linear-gradient(90deg, #FFD700, #C9A84C, #FFF5CC, #C9A84C, #FFD700)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '0.12em',
                  fontFamily: 'Georgia, serif',
                }}>
                SHREE RAM
              </div>
              <div
                className="font-bold text-center"
                style={{
                  fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.85)',
                  borderTop: '1px solid rgba(201,168,76,0.4)',
                  marginTop: '3px',
                  paddingTop: '2px',
                  letterSpacing: '0.45em',
                }}>
                ACADEMY
              </div>
            </div>
          </div>

          {/* User Avatar (desktop) */}
          <UserMenu />

          {/* Hamburger */}
          <button className="md:hidden flex flex-col gap-1.5 p-2 z-50 relative" onClick={() => setOpen((v) => !v)}>
            <span className="block w-6 h-0.5 transition-all" style={{ background: '#C9A84C', transform: open ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
            <span className="block w-6 h-0.5 transition-all" style={{ background: '#C9A84C', opacity: open ? 0 : 1 }} />
            <span className="block w-6 h-0.5 transition-all" style={{ background: '#C9A84C', transform: open ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
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
          background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
          borderRight: '2px solid #C9A84C',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          boxShadow: open ? '4px 0 24px rgba(0,0,0,0.6)' : 'none',
        }}>

        {/* Drawer Header */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(201,168,76,0.3)' }}>
          <img src="/logo.jpg" alt="logo" className="w-10 h-10 rounded-full object-cover" style={{ border: '2px solid #C9A84C' }} />
          <div className="leading-none">
            <div className="font-black" style={{ fontSize: '0.9rem', color: '#C9A84C', fontFamily: 'Georgia, serif', letterSpacing: '0.1em' }}>SHREE RAM</div>
            <div className="font-semibold" style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.35em' }}>ACADEMY</div>
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
                ? { background: 'linear-gradient(135deg, #C9A84C, #f0d080)', color: '#000' }
                : {}}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        {/* Drawer Footer */}
        <div className="px-5 py-4 text-center" style={{ borderTop: '1px solid rgba(201,168,76,0.2)' }}>
          <p className="text-xs" style={{ color: 'rgba(201,168,76,0.5)' }}>Since 2016</p>
        </div>
      </div>
    </>
  );
}
