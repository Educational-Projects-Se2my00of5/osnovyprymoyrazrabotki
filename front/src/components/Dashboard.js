import { useState, useEffect } from 'react';
import { getProfile } from '../api';
import './Dashboard.css';

function Dashboard({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ firstName: '', lastName: '' });

  // Заглушки данных (пока нет бэкенда)
  const [projects] = useState([
    { id: 1, name: 'Проект Alpha', role: 'Менеджер', status: 'Активен' },
    { id: 2, name: 'Проект Beta', role: 'Разработчик', status: 'Активен' },
    { id: 3, name: 'Проект Gamma', role: 'Наблюдатель', status: 'Закрыт' },
  ]);

  const [taskStats] = useState({
    assigned: { closed: 5, total: 12 },
  });

  const [newProject, setNewProject] = useState({ name: '', description: '', subjectName: '' });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки профиля');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleCreateProject = (e) => {
    e.preventDefault();
    // Заглушка: здесь будет вызов API для создания проекта
    alert(`Создан проект: ${newProject.name} (${newProject.subjectName})`);
    setNewProject({ name: '', description: '', subjectName: '' });
  };

  const handleOpenEditModal = () => {
    if (profile) {
      setEditedProfile({ firstName: profile.firstName, lastName: profile.lastName });
      setIsEditModalOpen(true);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    // Заглушка: здесь будет вызов API для обновления профиля
    alert(`Профиль обновлён: ${editedProfile.firstName} ${editedProfile.lastName}`);
    // Обновляем локальный state для демонстрации
    setProfile({ ...profile, firstName: editedProfile.firstName, lastName: editedProfile.lastName });
    setIsEditModalOpen(false);
  };

  const handleProjectClick = (projectId) => {
    // Заглушка: здесь будет переход на страницу проекта
    alert(`Переход к проекту ID: ${projectId}`);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Панель управления</h1>
        <button onClick={onLogout} className="dashboard-logout-button">
          Выйти
        </button>
      </div>

      <div className="dashboard-grid">
        {/* Левая колонка: профиль + проекты */}
        <div className="dashboard-left">
          {/* Профиль */}
          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h3 className="dashboard-section-title">Мой профиль</h3>
              {profile && (
                <button onClick={handleOpenEditModal} className="dashboard-edit-button">
                  Редактировать
                </button>
              )}
            </div>
            {loading && <p className="dashboard-loading">Загрузка...</p>}
            {error && <p className="dashboard-error">{error}</p>}
            {profile && (
              <div className="dashboard-profile">
                <div className="dashboard-info-row">
                  <span className="dashboard-label">Имя:</span>
                  <span className="dashboard-value">{profile.firstName}</span>
                </div>
                <div className="dashboard-info-row">
                  <span className="dashboard-label">Фамилия:</span>
                  <span className="dashboard-value">{profile.lastName}</span>
                </div>
                <div className="dashboard-info-row">
                  <span className="dashboard-label">Email:</span>
                  <span className="dashboard-value">{profile.email}</span>
                </div>
                <div className="dashboard-info-row">
                  <span className="dashboard-label">Регистрация:</span>
                  <span className="dashboard-value">
                    {profile.registrationDate
                      ? new Date(profile.registrationDate).toLocaleDateString('ru-RU')
                      : '—'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Проекты */}
          <div className="dashboard-section">
            <h3 className="dashboard-section-title">Мои проекты</h3>
            {projects.length === 0 ? (
              <p className="dashboard-placeholder-text">Нет проектов</p>
            ) : (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Роль</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((proj) => (
                    <tr key={proj.id}>
                      <td>
                        <span
                          className="dashboard-project-link"
                          onClick={() => handleProjectClick(proj.id)}
                        >
                          {proj.name}
                        </span>
                      </td>
                      <td>{proj.role}</td>
                      <td>
                        <span
                          className={`dashboard-badge ${proj.status === 'Активен' ? 'badge-active' : 'badge-closed'}`}
                        >
                          {proj.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Правая колонка: статистика задач + создание проекта */}
        <div className="dashboard-right">
          {/* Статистика задач */}
          <div className="dashboard-section">
            <h3 className="dashboard-section-title">Статистика по задачам</h3>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Тип</th>
                  <th>Закрыто</th>
                  <th>Всего</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Назначенные задачи</td>
                  <td>{taskStats.assigned.closed}</td>
                  <td>{taskStats.assigned.total}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Создание проекта */}
          <div className="dashboard-section">
            <h3 className="dashboard-section-title">Создать проект</h3>
            <form onSubmit={handleCreateProject} className="dashboard-form">
              <div className="dashboard-input-group">
                <label className="dashboard-label-form">Название проекта:</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                  className="dashboard-input"
                  placeholder="Введите название проекта"
                />
              </div>
              <div className="dashboard-input-group">
                <label className="dashboard-label-form">Предмет:</label>
                <input
                  type="text"
                  value={newProject.subjectName}
                  onChange={(e) => setNewProject({ ...newProject, subjectName: e.target.value })}
                  required
                  className="dashboard-input"
                  placeholder="Например: Основы прямой разработки"
                />
              </div>
              <div className="dashboard-input-group">
                <label className="dashboard-label-form">Описание:</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="dashboard-textarea"
                  placeholder="Краткое описание проекта"
                  rows={3}
                />
              </div>
              <button type="submit" className="dashboard-create-button">
                Создать проект
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Модальное окно редактирования профиля */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Редактировать профиль</h3>
              <button onClick={handleCloseEditModal} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleSaveProfile} className="modal-form">
              <div className="dashboard-input-group">
                <label className="dashboard-label-form">Имя:</label>
                <input
                  type="text"
                  value={editedProfile.firstName}
                  onChange={(e) => setEditedProfile({ ...editedProfile, firstName: e.target.value })}
                  required
                  className="dashboard-input"
                />
              </div>
              <div className="dashboard-input-group">
                <label className="dashboard-label-form">Фамилия:</label>
                <input
                  type="text"
                  value={editedProfile.lastName}
                  onChange={(e) => setEditedProfile({ ...editedProfile, lastName: e.target.value })}
                  required
                  className="dashboard-input"
                />
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={handleCloseEditModal} className="modal-cancel-button">
                  Отмена
                </button>
                <button type="submit" className="modal-save-button">
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
