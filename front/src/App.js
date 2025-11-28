import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProjectPage from './components/ProjectPage';
import { logout as apiLogout } from './api';
import { clearAuth, getAccessToken, getRefreshToken } from './api/storage';

function App() {

  useEffect(() => {
    if (!(getAccessToken() && getRefreshToken())) {
      clearAuth();
    }
  }, []);

  const isAuthenticated = () => !!(getAccessToken() && getRefreshToken());

  const LoginRoute = () => {
    const navigate = useNavigate();
    return (
      <Login
        goToRegister={() => navigate('/register')}
        goToMain={() => navigate('/')}
      />
    );
  };

  const RegisterRoute = () => {
    const navigate = useNavigate();
    return <Register goToLogin={() => navigate('/login')} />;
  };

  const DashboardRoute = () => {
    const navigate = useNavigate();
    const handleLogout = async () => {
      await apiLogout();
      clearAuth();
      navigate('/login');
    };
    return isAuthenticated() ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" replace />;
  };

  const ProjectRoute = () => (isAuthenticated() ? <ProjectPage /> : <Navigate to="/login" replace />);

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/register" element={<RegisterRoute />} />
        <Route path="/projects/:id" element={<ProjectRoute />} />
        <Route path="/" element={<DashboardRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
