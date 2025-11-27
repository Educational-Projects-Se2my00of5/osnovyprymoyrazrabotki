import './Dashboard.css';

function Dashboard({ token, onLogout }) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Панель управления</h1>
        <button onClick={onLogout} className="dashboard-logout-button">
          Выйти
        </button>
      </div>

      <div className="dashboard-user-info">
        <h2 className="dashboard-subtitle">Добро пожаловать!</h2>
        <div className="dashboard-info-row">
          <span className="dashboard-label">Имя:</span>
          <span className="dashboard-value">{user?.firstName || 'Не указано'}</span>
        </div>
        <div className="dashboard-info-row">
          <span className="dashboard-label">Фамилия:</span>
          <span className="dashboard-value">{user?.lastName || 'Не указано'}</span>
        </div>
        <div className="dashboard-info-row">
          <span className="dashboard-label">Email:</span>
          <span className="dashboard-value">{user?.email || 'Не указан'}</span>
        </div>
      </div>

      <div className="dashboard-section">
        <h3 className="dashboard-section-title">Мои проекты</h3>
        <div className="dashboard-placeholder">
          <p className="dashboard-placeholder-text">
            Здесь будет отображаться список ваших проектов
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
