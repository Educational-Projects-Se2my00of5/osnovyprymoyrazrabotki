import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTask } from '../api/tasks';
import './TaskDetailsPage.css';

function TaskDetailsPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const taskData = await getTask(taskId);
        setTask(taskData);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки задачи');
      } finally {
        setLoading(false);
      }
    };
    if (taskId) load();
  }, [taskId]);

  const getStatusLabel = (status) => {
    const statuses = {
      'NOT_STARTED': 'Не начата',
      'IN_PROGRESS': 'В работе',
      'COMPLETED': 'Завершена',
      'BLOCKED': 'Заблокирована'
    };
    return statuses[status] || status;
  };

  const getPriorityLabel = (priority) => {
    if (priority >= 8) return 'Высокий';
    if (priority >= 4) return 'Средний';
    return 'Низкий';
  };

  const isOverdue = () => {
    if (!task || !task.deadline || task.status === 'COMPLETED') return false;
    return new Date(task.deadline) < new Date();
  };

  if (loading) {
    return (
      <div className="task-details-page">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-details-page">
        <p className="task-details-error">{error}</p>
        <button onClick={() => navigate(-1)} className="task-details-back-button">Назад</button>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="task-details-page">
        <p>Задача не найдена</p>
        <button onClick={() => navigate(-1)} className="task-details-back-button">Назад</button>
      </div>
    );
  }

  return (
    <div className="task-details-page">
      {/* Header */}
      <div className="task-details-header">
        <h1 className="task-details-title">{task.title}</h1>
        <div className="task-details-header-actions">
          <button onClick={() => navigate(`/projects/${task.projectId}`)} className="task-details-back-button">
            К проекту
          </button>
          <button onClick={() => navigate(-1)} className="task-details-back-button">Назад</button>
        </div>
      </div>

      <div className="task-details-grid">
        {/* Main info */}
        <div className="task-details-section">
          <h2 className="task-details-section-title">Информация о задаче</h2>
          <div className="task-details-info">
            <div className="task-details-info-row">
              <span className="task-details-label">Проект:</span>
              <span 
                className="task-details-value task-details-project-link"
                onClick={() => navigate(`/projects/${task.projectId}`)}
              >
                {task.projectName || '—'}
              </span>
            </div>
            <div className="task-details-info-row">
              <span className="task-details-label">Статус:</span>
              <span className={`task-details-status task-details-status-${task.status?.toLowerCase()}`}>
                {getStatusLabel(task.status)}
              </span>
            </div>
            <div className="task-details-info-row">
              <span className="task-details-label">Приоритет:</span>
              <span className="task-details-value">
                {getPriorityLabel(task.priority)} ({task.priority})
              </span>
            </div>
            <div className="task-details-info-row">
              <span className="task-details-label">Дедлайн:</span>
              <span className={`task-details-value ${isOverdue() ? 'task-details-overdue' : ''}`}>
                {task.deadline ? new Date(task.deadline).toLocaleString('ru-RU') : '—'}
                {isOverdue() && <span className="task-details-overdue-badge"> Просрочено</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="task-details-section">
          <h2 className="task-details-section-title">Описание</h2>
          <div className="task-details-description">
            {task.description || 'Описание отсутствует'}
          </div>
        </div>

        {/* Assignees */}
        <div className="task-details-section">
          <h2 className="task-details-section-title">Исполнители</h2>
          {task.assignees && task.assignees.length > 0 ? (
            <div className="task-details-assignees">
              {task.assignees.map((assignee, index) => (
                <div key={index} className="task-details-assignee-card">
                  <div className="task-details-assignee-name">
                    {assignee.firstName} {assignee.lastName}
                  </div>
                  {assignee.role && (
                    <div className="task-details-assignee-role">{assignee.role}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="task-details-placeholder">Исполнители не назначены</p>
          )}
        </div>

        {/* Dependencies */}
        <div className="task-details-section">
          <h2 className="task-details-section-title">Зависимости</h2>
          {task.dependencies && task.dependencies.length > 0 ? (
            <div className="task-details-dependencies">
              {task.dependencies.map((dep) => (
                <div key={dep.id} className="task-details-dependency-card">
                  <div className="task-details-dependency-title">{dep.requiredTaskTitle}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="task-details-placeholder">Зависимостей нет</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskDetailsPage;
