import { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import { logout as apiLogout } from './api';

function App() {
  const [currentPage, setCurrentPage] = useState('login'); // 'login', 'register', 'dashboard'
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [refreshtoken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));

  // Проверяем токен при загрузке
  useEffect(() => {
    const savedAccessToken = localStorage.getItem('accessToken');
    const savedRefreshToken = localStorage.getItem('refreshToken');
    if (savedAccessToken && savedRefreshToken) {
      try {
        setAccessToken(savedAccessToken)
        setRefreshToken(savedRefreshToken)
        setCurrentPage('dashboard');
      } catch (err) {
        console.error('Ошибка восстановления сессии:', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
  }, []);

  const handleLoginSuccess = (userData, accessToken, refreshToken) => {
    setUser(userData);
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    await apiLogout();
    setAccessToken(null);
    setAccessToken(null);
    setCurrentPage('login');
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
          onLoginSuccess={handleLoginSuccess} 
          onGoToRegister={goToRegister}
        />
      )}
      
      {currentPage === 'register' && (
        <Register 
          onRegisterSuccess={() => setCurrentPage('login')}
          onGoToLogin={goToLogin}
        />
      )}
      
      {currentPage === 'dashboard' && (
        <Dashboard 
          token={accessToken}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
