import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject } from '../api/projects';
import { getProjectTasks } from '../api/tasks';
import GanttChart1 from './GanttChart1';
import './GanttPage.css';

function GanttPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [projectData, tasksData] = await Promise.all([
          getProject(projectId),
          getProjectTasks(projectId)
        ]);
        setProject(projectData);
        setTasks(tasksData);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };
    if (projectId) load();
  }, [projectId]);

  if (loading) {
    return (
      <div className="gantt-page">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gantt-page">
        <p className="gantt-error">{error}</p>
        <button onClick={() => navigate(`/projects/${projectId}`)} className="gantt-back-button">
          Назад к проекту
        </button>
      </div>
    );
  }

  return (
    <div className="gantt-page">
      {/* Header */}
      <div className="gantt-header">
        <div className="gantt-header-content">
          <h1 className="gantt-header-title">
            Реверсивная диаграмма Ганта
          </h1>
          {project && (
            <p className="gantt-header-subtitle">
              Проект: {project.name}
            </p>
          )}
        </div>
        <button 
          onClick={() => navigate(`/projects/${projectId}`)} 
          className="gantt-back-button"
        >
          Назад к проекту
        </button>
      </div>

      {/* Описание реверсивной логики */}
      <div className="gantt-info">
        <h3>ℹ️ Как читать реверсивную диаграмму:</h3>
        <ul>
          <li><strong>Конец полосы</strong> — это дедлайн задачи</li>
          <li><strong>Начало полосы</strong> — у всех один и тот же момент времени, создание проекта</li>
          <li><strong>Стрелки</strong> показывают зависимости: дочерняя → родительская (выполняется раньше)</li>
          <li><strong>Цвет</strong> заливки — приоритет задачи (красный = высокий, жёлтый = средний, синий = низкий)</li>
          <li><strong>Темнее цвет</strong> заливки — выполненная задача</li>
          <li><strong>Чёрная обводка</strong> — просроченная задача</li>
        </ul>
      </div>

      {/* Диаграмма */}
      <div className="gantt-content">
        <GanttChart1 tasks={tasks} project={project} />
      </div>

      {/* Статистика */}
      {tasks.length > 0 && (
        <div className="gantt-stats">
          <div className="gantt-stat-item">
            <span className="gantt-stat-label">Всего задач:</span>
            <span className="gantt-stat-value">{tasks.length}</span>
          </div>
          <div className="gantt-stat-item">
            <span className="gantt-stat-label">Завершено:</span>
            <span className="gantt-stat-value">
              {tasks.filter(t => t.status === 'COMPLETED').length}
            </span>
          </div>
          <div className="gantt-stat-item">
            <span className="gantt-stat-label">В работе:</span>
            <span className="gantt-stat-value">
              {tasks.filter(t => t.status === 'IN_PROGRESS').length}
            </span>
          </div>
          <div className="gantt-stat-item">
            <span className="gantt-stat-label">Не начато:</span>
            <span className="gantt-stat-value">
              {tasks.filter(t => t.status === 'NOT_STARTED').length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default GanttPage;
