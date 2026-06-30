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

function PrivateRoute({ children }) {
  return localStorage.getItem('adminToken') ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <PrivateRoute>
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
                  </Routes>
                </main>
              </div>
              <footer style={{ background: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)', borderTop: '2px solid #C9A84C' }}>
                <div className="w-full px-6 md:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <span className="text-sm font-bold" style={{ color: '#C9A84C' }}></span>
                  <span className="text-xs text-center" style={{ color: '#888' }}>
                    © {new Date().getFullYear()} Shree Ram Academy. All rights reserved.
                  </span>
                  <span className="hidden sm:inline text-xs" style={{ color: '#666' }}>Since 2016</span>
                </div>
              </footer>
            </div>
          </PrivateRoute>
        } />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}
