import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import toast from 'react-hot-toast';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      localStorage.setItem('adminToken', res.token);
      localStorage.setItem('adminEmail', res.email);
      toast.success('Welcome!');
      navigate('/');
    } catch {
      toast.error('Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg,#0a0a0a 0%,#1a1a1a 60%,#0a0a0a 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.jpg" alt="logo"
            className="w-20 h-20 rounded-full object-cover mb-4"
            style={{ border: '3px solid #C9A84C', boxShadow: '0 0 24px rgba(201,168,76,0.4)' }} />
          <div className="text-center leading-none">
            <div className="font-black tracking-widest"
              style={{ fontSize: '1.4rem', background: 'linear-gradient(90deg,#FFD700,#C9A84C,#FFF5CC,#C9A84C,#FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontFamily: 'Georgia, serif' }}>
              SHREE RAM
            </div>
            <div className="font-bold tracking-[0.45em] mt-1"
              style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', borderTop: '1px solid rgba(201,168,76,0.4)', paddingTop: '4px' }}>
              ACADEMY
            </div>
          </div>
          <p className="text-xs mt-3" style={{ color: 'rgba(201,168,76,0.6)' }}>Admin Portal</p>
        </div>

        <div className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(201,168,76,0.3)', backdropFilter: 'blur(10px)' }}>
          <h2 className="text-base font-black text-white mb-5 text-center">Sign In</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'rgba(201,168,76,0.8)' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@example.com"
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(201,168,76,0.3)', color: '#fff' }} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'rgba(201,168,76,0.8)' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(201,168,76,0.3)', color: '#fff' }} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-black mt-1 transition-opacity"
              style={{ background: 'linear-gradient(135deg,#C9A84C,#f0d080)', color: '#000', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>© {new Date().getFullYear()} Shree Ram Academy</p>
      </div>
    </div>
  );
}
