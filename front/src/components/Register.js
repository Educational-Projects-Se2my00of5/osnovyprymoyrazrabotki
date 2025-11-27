import { useState } from 'react';
import { register } from '../api';
import './Register.css';

function Register({ onRegisterSuccess, onGoToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(email, password, firstName, lastName);
      alert('Регистрация успешна! Теперь вы можете войти.');
      onRegisterSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка регистрации. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form-box">
        <h1 className="register-title">Регистрация</h1>
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-input-group">
            <label className="register-label">Имя:</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="register-input"
              placeholder="Иван"
            />
          </div>

          <div className="register-input-group">
            <label className="register-label">Фамилия:</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="register-input"
              placeholder="Иванов"
            />
          </div>

          <div className="register-input-group">
            <label className="register-label">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="register-input"
              placeholder="example@mail.com"
            />
          </div>

          <div className="register-input-group">
            <label className="register-label">Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              className="register-input"
              placeholder="Минимум 6 символов"
            />
          </div>

          {error && <div className="register-error">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="register-button"
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="register-footer">
          <p className="register-footer-text">
            Уже есть аккаунт?{' '}
            <button 
              onClick={onGoToLogin}
              className="register-link"
            >
              Войти
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
