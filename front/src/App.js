import { useEffect, useState } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import { logout as apiLogout } from './api';
import { clearAuth, getAccessToken, getRefreshToken } from './api/storage';

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  // Проверяем токен при загрузке
  useEffect(() => {
    if (getAccessToken() && getRefreshToken()) {
      try {
        setCurrentPage('dashboard');
      } catch (err) {
        console.error('Ошибка восстановления сессии:', err);
        clearAuth();
      }
    }
  }, []);


  const handleLogout = async () => {
    await apiLogout();
    clearAuth();
    setCurrentPage('login');
  };

  const goToDashboard = () => {
    setCurrentPage('dashboard');
  };

  const goToRegister = () => {
    setCurrentPage('register');
  };

  const goToLogin = () => {
    setCurrentPage('login');
  };

  return (
    <div className="App">
      {currentPage === 'login' && (
        <Login
          goToRegister={goToRegister}
          goToMain={goToDashboard}
        />
      )}

      {currentPage === 'register' && (
        <Register
          goToLogin={goToLogin}
        />
      )}

      {currentPage === 'dashboard' && (
        <Dashboard
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
