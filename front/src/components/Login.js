import { useState } from 'react';
import { login } from '../api';
import './Login.css';
import { setAuthTokens } from '../api/storage';

function Login({ goToMain, goToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const BothTokensResponseDto = await login(email, password);
      setAuthTokens(BothTokensResponseDto);
      goToMain();
    } catch (err) {
      setError(err.message || 'Ошибка входа. Проверьте email и пароль.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-box">
        <h1 className="login-title">Вход в систему</h1>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-input-group">
            <label className="login-label">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
              placeholder="example@mail.com"
            />
          </div>

          <div className="login-input-group">
            <label className="login-label">Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
              placeholder="Введите пароль"
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="login-footer">
          <p className="login-footer-text">
            Нет аккаунта?{' '}
            <button
              onClick={goToRegister}
              className="login-link"
            >
              Зарегистрироваться
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
