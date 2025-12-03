import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getAllMyTasks, getProjectTasks, getMyTasksInProject, getMemberTasks } from '../api/tasks';
import { getProject } from '../api/projects';
import { getStatusLabel, statusFilters, sortOptions, filterTasksByStatus, sortTasks } from '../utils/taskUtils';
import './TasksPage.css';

function TasksPage() {
  const { projectId, userId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Фильтры из query параметров
  const statusFilter = searchParams.get('status') || 'all';
  const sortBy = searchParams.get('sort') || 'deadline';
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage, setTasksPerPage] = useState(10);
  
  // Определяем режим отображения
  const isAllUserTasks = !projectId && !userId;
  const isProjectTasks = projectId && !userId;
  const isUserProjectTasks = projectId && userId;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let tasksData;
        
        if (isAllUserTasks) {
          // Все задачи пользователя по всем проектам
          tasksData = await getAllMyTasks();
        } else if (isProjectTasks) {
          // Все задачи проекта
          const proj = await getProject(projectId);
          setProject(proj);
          tasksData = await getProjectTasks(projectId);
        } else if (isUserProjectTasks) {
          // Задачи конкретного пользователms.get('sort')я в проекте
          const proj = await getProject(projectId);
          setProject(proj);
          
          tasksData = await getMemberTasks(projectId, userId);
        }
        
        setTasks(tasksData || []);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [projectId, userId, isAllUserTasks, isProjectTasks, isUserProjectTasks]);

  // Применяем фильтры и сортировку
  useEffect(() => {
    let result = filterTasksByStatus(tasks, statusFilter);
    result = sortTasks(result, sortBy);
    setFilteredTasks(result);
    setCurrentPage(1);
  }, [tasks, statusFilter, sortBy]);

  // Сбрасываем на первую страницу при изменении tasksPerPage
  useEffect(() => {
    setCurrentPage(1);
  }, [tasksPerPage]);

  const getPageTitle = () => {
    if (isAllUserTasks) return 'Мои задачи';
    if (isProjectTasks) return 'Все задачи проекта';
    if (isUserProjectTasks && userId === 'my') return 'Мои задачи в проекте';
    return 'Задачи участника';
  };

  const getUserName = () => {
    if (!project || !userId || userId === 'my') return null;
    const member = project.members?.find(m => String(m.id) === userId);
    return member ? `${member.firstName} ${member.lastName}` : 'Неизвестный пользователь';
  };

  const handleFilterChange = (newStatus) => {
    setSearchParams({ status: newStatus, sort: sortBy });
  };

  const handleSortChange = (newSort) => {
    setSearchParams({ status: statusFilter, sort: newSort });
  };

  // Пагинация
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  if (loading) {
    return (
      <div className="tasks-page">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tasks-page">
        <p className="tasks-error">{error}</p>
        <button onClick={() => navigate(projectId ? `/projects/${projectId}` : '/')} className="tasks-back-button">
          Назад
        </button>
      </div>
    );
  }

  return (
    <div className="tasks-page">
      {/* Header */}
      <div className="tasks-header">
        <h1 className="tasks-header-title">
          {project ? `Проект: ${project.name}` : 'Мои задачи'}
        </h1>
        <div className="tasks-header-actions">
          <button 
            onClick={() => navigate(projectId ? `/projects/${projectId}` : '/')} 
            className="tasks-back-button"
          >
            {projectId ? 'Назад к проекту' : 'На главную'}
          </button>
        </div>
      </div>

      {/* Two-column grid like ProjectPage */}
      <div className="tasks-grid">
        {/* Left column - Filters */}
        <div className="tasks-left">
          <div className="tasks-section">
            <h3 className="tasks-section-title">Фильтры и сортировка</h3>
            <div className="tasks-filters-content">
              <div className="tasks-filter-group">
                <label className="tasks-filter-label">Статус:</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="tasks-filter-select"
                >
                  {statusFilters.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div className="tasks-filter-group">
                <label className="tasks-filter-label">Сортировка:</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="tasks-filter-select"
                >
                  {sortOptions.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Tasks */}
        <div className="tasks-right">
          <div className="tasks-section">
            <div className="tasks-section-header">
              <h3 className="tasks-section-title">
                {getUserName() ? `Задачи пользователя: ${getUserName()}` : getPageTitle()}
              </h3>
              <div className="tasks-header-controls">
                <span className="tasks-count-badge">Найдено: {filteredTasks.length}</span>
                <div className="tasks-per-page">
                  <label>На странице:</label>
                  <select value={tasksPerPage} onChange={(e) => setTasksPerPage(Number(e.target.value))} className="tasks-per-page-select">
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>

            {currentTasks.length === 0 ? (
              <p className="tasks-placeholder">Задач нет</p>
            ) : (
              <>
                <div className="tasks-list">
                  {currentTasks.map((task) => (
                    <div key={task.id} className="task-card">
                      <div className="task-card-header">
                        <h4 className="task-title">{task.title}</h4>
                        <span className={`task-status task-status-${task.status?.toLowerCase()}`}>
                          {getStatusLabel(task.status)}
                        </span>
                      </div>
                      <p className="task-description">
                        {task.description 
                          ? (task.description.length > 100 
                              ? task.description.substring(0, 100) + '...' 
                              : task.description)
                          : 'Нет описания'}
                      </p>
                      <div className="task-card-footer">
                        <div className="task-info">
                          <span className="task-info-label">Дедлайн:</span>
                          <span className="task-info-value">
                            {task.deadline 
                              ? new Date(task.deadline).toLocaleString('ru-RU', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '—'}
                          </span>
                        </div>
                        <div className="task-info">
                          <span className="task-info-label">Приоритет:</span>
                          <span className="task-info-value">{task.priority}</span>
                        </div>
                        <div className="task-info">
                          <span className="task-info-label">Исполнители:</span>
                          <span className="task-info-value">
                            {task.assignees && task.assignees.length > 0
                              ? task.assignees.map(a => `${a.firstName} ${a.lastName}`).join(', ')
                              : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="tasks-pagination">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="tasks-pagination-button"
                    >
                      Предыдущая
                    </button>
                    <span className="tasks-pagination-info">
                      Страница {currentPage} из {totalPages}
                    </span>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="tasks-pagination-button"
                    >
                      Следующая
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TasksPage;
