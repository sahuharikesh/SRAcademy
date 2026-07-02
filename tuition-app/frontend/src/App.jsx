import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar     from './components/Navbar';
import Sidebar    from './components/Sidebar';
import Login      from './pages/Login';
import Dashboard  from './pages/Dashboard';
import Students   from './pages/Students';
import Attendance from './pages/Attendance';
import Fees       from './pages/Fees';
import Groups        from './pages/Groups';
import QuestionPaper from './pages/QuestionPaper';
import Result        from './pages/Result';
import Settings       from './pages/Settings';
import { AcademyProvider, useAcademy } from './context/AcademyContext';

function PrivateRoute({ children }) {
  return localStorage.getItem('adminToken') ? children : <Navigate to="/login" replace />;
}

function AppFooter() {
  const { academy } = useAcademy() || {};
  return (
    <footer style={{ background: 'var(--brand-dark, #1a1a1a)', borderTop: '2px solid var(--brand-gold, #C9A84C)' }}>
      <div className="w-full px-6 md:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="text-sm font-bold" style={{ color: 'var(--brand-gold, #C9A84C)' }}></span>
        <span className="text-xs text-center" style={{ color: '#888' }}>
          © {new Date().getFullYear()} {academy?.academyName || 'Tuition Manager'}. All rights reserved.
        </span>
        <span className="hidden sm:inline text-xs" style={{ color: '#666' }}>Since 2016</span>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <PrivateRoute>
            <AcademyProvider>
              <div className="min-h-screen flex flex-col" style={{ background: '#f0f2f5' }}>
                <Navbar />
                <div className="flex flex-1">
                  <Sidebar />
                  <main className="flex-1 w-full px-4 sm:px-6 md:px-10 py-4 sm:py-6 min-w-0 page-enter">
                    <Routes>
                      <Route path="/"           element={<Dashboard />}  />
                      <Route path="/students"   element={<Students />}   />
                      <Route path="/attendance" element={<Attendance />} />
                      <Route path="/fees"       element={<Fees />}       />
                      <Route path="/groups"          element={<Groups />}        />
                      <Route path="/question-paper" element={<QuestionPaper />} />
                      <Route path="/result"         element={<Result />}        />
                      <Route path="/settings"       element={<Settings />}      />
                    </Routes>
                  </main>
                </div>
                <AppFooter />
              </div>
            </AcademyProvider>
          </PrivateRoute>
        } />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}
