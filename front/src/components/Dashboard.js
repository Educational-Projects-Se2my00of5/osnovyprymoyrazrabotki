import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, getProjects, createProject, getTaskStats } from '../api';
import { getStatusLabel } from '../utils/projectUtils';
import './Dashboard.css';

function Dashboard({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ firstName: '', lastName: '' });
  const [modalError, setModalError] = useState('');

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState('');

  const [taskStats, setTaskStats] = useState({ total: 0, closed: 0, overdue: 0 });
  const [taskStatsLoading, setTaskStatsLoading] = useState(true);
  const [taskStatsError, setTaskStatsError] = useState('');

  const [newProject, setNewProject] = useState({ name: '', description: '', subjectName: '' });
  const [createMessage, setCreateMessage] = useState({ type: '', text: '' });

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
    // Загрузка списка проектов
    const loadProjects = async () => {
      setProjectsLoading(true);
      try {
        const list = await getProjects();
        setProjects(list || []);
        setProjectsError('');
      } catch (err) {
        setProjectsError(err.message || 'Не удалось загрузить проекты');
      } finally {
        setProjectsLoading(false);
      }
    };
    loadProjects();
    // загрузка статистики задач
    const loadTaskStats = async () => {
      setTaskStatsLoading(true);
      try {
        const stats = await getTaskStats();
        setTaskStats(stats || { total: 0, closed: 0, overdue: 0 });
        setTaskStatsError('');
      } catch (err) {
        setTaskStatsError(err.message || 'Ошибка загрузки статистики задач');
      } finally {
        setTaskStatsLoading(false);
      }
    };
    loadTaskStats();
  }, []);

  const handleCreateProject = (e) => {
    e.preventDefault();
    const doCreate = async () => {
      if (!newProject.name.trim()) {
        setCreateMessage({ type: 'error', text: 'Название проекта обязательно' });
        return;
      }
      if (!newProject.subjectName || !newProject.subjectName.trim()) {
        setCreateMessage({ type: 'error', text: 'Предмет проекта обязателен' });
        return;
      }
      try {
        const created = await createProject(newProject.name, newProject.description, newProject.subjectName);
        setCreateMessage({ type: 'success', text: `Создан проект: ${created.name || newProject.name}` });
        setNewProject({ name: '', description: '', subjectName: '' });
        // Обновляем список проектов
        const list = await getProjects();
        setProjects(list || []);
      } catch (err) {
        setCreateMessage({ type: 'error', text: err.message || 'Ошибка при создании проекта' });
      }
    };
    doCreate();
  };

  const handleOpenEditModal = () => {
    if (profile) {
      setEditedProfile({ firstName: profile.firstName, lastName: profile.lastName });
      setModalError('');
      setIsEditModalOpen(true);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    // Вызываем API обновления профиля
    try {
      setLoading(true);
      const updated = await updateProfile(
        editedProfile.firstName,
        editedProfile.lastName
      );
      setProfile(updated);
      setIsEditModalOpen(false);
      setModalError('');
    } catch (err) {
      setModalError(err.message || 'Не удалось обновить профиль');
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();
  const handleProjectClick = (projectId) => {
    // navigate to project page
    navigate(`/projects/${projectId}`);
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
            {projectsLoading ? (
              <p className="dashboard-loading">Загрузка проектов...</p>
            ) : projectsError ? (
              <p className="dashboard-error">{projectsError}</p>
            ) : projects.length === 0 ? (
              <p className="dashboard-placeholder-text">Нет проектов</p>
            ) : (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Предмет</th>
                    <th>Роль</th>
                    <th>Статус</th>
                    <th>Создан</th>
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
                      <td>{proj.subjectName || '—'}</td>
                      <td>{proj.role || '—'}</td>
                      <td>{getStatusLabel(proj.status)}</td>
                      <td>{proj.createdAt ? new Date(proj.createdAt).toLocaleString('ru-RU') : '—'}</td>
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
            {taskStatsLoading ? (
              <p className="dashboard-loading">Загрузка статистики...</p>
            ) : taskStatsError ? (
              <p className="dashboard-error">{taskStatsError}</p>
            ) : (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Тип</th>
                    <th>Закрыто</th>
                    <th>Просрочено</th>
                    <th>Всего</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Назначенные задачи</td>
                    <td>
                      <span className="dashboard-stats-link" onClick={() => navigate('/tasks?status=completed')}>
                        {taskStats.closed ?? 0}
                      </span>
                    </td>
                    <td>
                      <span className="dashboard-stats-link" onClick={() => navigate('/tasks?status=overdue')}>
                        {taskStats.overdue ?? 0}
                      </span>
                    </td>
                    <td>
                      <span className="dashboard-stats-link" onClick={() => navigate('/tasks?status=all')}>
                        {taskStats.total ?? 0}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
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
              {createMessage.text && (
                <div className={`dashboard-create-message ${createMessage.type === 'error' ? 'error' : 'success'}`}>
                  {createMessage.text}
                </div>
              )}
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
              {modalError && <div className="modal-error">{modalError}</div>}
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
