import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTask, updateTask, getProjectMembers, getProjectTasksOptions } from '../api/tasks';
import { getStatusLabel, getPriorityLabel, isTaskOverdue, taskStatuses, taskPriorities } from '../utils/taskUtils';
import SelectAssigneeModal from './SelectAssigneeModal';
import SelectParentTaskModal from './SelectParentTaskModal';
import './TaskDetailsPage.css';

function TaskDetailsPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [saveError, setSaveError] = useState('');
  const [showAssigneeModal, setShowAssigneeModal] = useState(false);
  const [allProjectMembers, setAllProjectMembers] = useState([]);
  const [showParentTaskModal, setShowParentTaskModal] = useState(false);
  const [allProjectTasks, setAllProjectTasks] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const taskData = await getTask(taskId);
        setTask(taskData);
        // Инициализируем форму редактирования
        setEditFormData({
          title: taskData.title,
          description: taskData.description || '',
          deadline: taskData.deadline ? taskData.deadline.substring(0, 10) : '',
          priority: taskData.priority,
          status: taskData.status,
          assigneeIds: taskData.assignees.map(a => a.memberId),
          parentTaskId: taskData.parentTask ? taskData.parentTask.taskId : null
        });
      } catch (err) {
        setError(err.message || 'Ошибка загрузки задачи');
      } finally {
        setLoading(false);
      }
    };
    if (taskId) load();
  }, [taskId]);

  const handleEditClick = async () => {
    setIsEditing(true);
    setSaveError('');
    // Загружаем всех участников проекта для отображения
    try {
      const members = await getProjectMembers(task.projectId);
      setAllProjectMembers(members);
      const tasks = await getProjectTasksOptions(task.projectId);
      setAllProjectTasks(tasks);
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSaveError('');
    // Восстанавливаем данные из task
    setEditFormData({
      title: task.title,
      description: task.description || '',
      deadline: task.deadline ? task.deadline.substring(0, 10) : '',
      priority: task.priority,
      status: task.status,
      assigneeIds: task.assignees.map(a => a.memberId),
      parentTaskId: task.parentTask ? task.parentTask.taskId : null
    });
  };

  const handleSaveEdit = async () => {
    setSaveError('');
    
    if (!editFormData.title || editFormData.title.trim().length < 3) {
      setSaveError('Название должно содержать минимум 3 символа');
      return;
    }
    
    if (!editFormData.deadline) {
      setSaveError('Дедлайн обязателен');
      return;
    }
    
    if (editFormData.assigneeIds.length === 0) {
      setSaveError('Необходимо назначить хотя бы одного исполнителя');
      return;
    }

    try {
      const updatePayload = {
        ...editFormData,
        deadline: new Date(editFormData.deadline + 'T23:59:59').toISOString()
      };
      
      const updatedTask = await updateTask(taskId, updatePayload);
      setTask(updatedTask);
      setEditFormData({
        title: updatedTask.title,
        description: updatedTask.description || '',
        deadline: updatedTask.deadline ? updatedTask.deadline.substring(0, 10) : '',
        priority: updatedTask.priority,
        status: updatedTask.status,
        assigneeIds: updatedTask.assignees.map(a => a.memberId),
        parentTaskId: updatedTask.parentTask ? updatedTask.parentTask.taskId : null
      });
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.message || 'Ошибка сохранения задачи');
    }
  };

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddAssignee = (member) => {
    setEditFormData(prev => ({
      ...prev,
      assigneeIds: [...prev.assigneeIds, member.memberId]
    }));
    setShowAssigneeModal(false);
  };

  const handleRemoveAssignee = (memberId) => {
    if (editFormData.assigneeIds.length <= 1) {
      setSaveError('Необходимо оставить хотя бы одного исполнителя');
      return;
    }
    setEditFormData(prev => ({
      ...prev,
      assigneeIds: prev.assigneeIds.filter(id => id !== memberId)
    }));
    setSaveError('');
  };

  const handleSelectParentTask = (taskOption) => {
    setEditFormData(prev => ({
      ...prev,
      parentTaskId: taskOption.id
    }));
    setShowParentTaskModal(false);
  };

  const handleRemoveParentTask = () => {
    setEditFormData(prev => ({
      ...prev,
      parentTaskId: null
    }));
  };

  const getExcludedTaskIds = () => {
    const excluded = [parseInt(taskId)]; // Сама задача
    
    // Добавляем родительскую задачу
    if (task.parentTask) {
      excluded.push(task.parentTask.taskId);
    }
    
    // Добавляем все дочерние задачи
    if (task.dependencies && task.dependencies.length > 0) {
      task.dependencies.forEach(dep => {
        excluded.push(dep.taskId);
      });
    }
    
    return excluded;
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
          {!isEditing ? (
            <>
              <button onClick={handleEditClick} className="task-details-edit-button">
                Редактировать
              </button>
              <button onClick={() => navigate(`/projects/${task.projectId}`)} className="task-details-back-button">
                К проекту
              </button>
              <button onClick={() => navigate(-1)} className="task-details-back-button">Назад</button>
            </>
          ) : (
            <>
              <button onClick={handleSaveEdit} className="task-details-save-button">
                Сохранить
              </button>
              <button onClick={handleCancelEdit} className="task-details-cancel-button">
                Отмена
              </button>
            </>
          )}
        </div>
      </div>

      {saveError && (
        <div className="task-details-save-error">{saveError}</div>
      )}

      <div className="task-details-grid">
        {/* Main info */}
        <div className="task-details-section">
          <h2 className="task-details-section-title">Информация о задаче</h2>
          {!isEditing ? (
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
                  {getPriorityLabel(task.priority)}
                </span>
              </div>
              <div className="task-details-info-row">
                <span className="task-details-label">Дедлайн:</span>
                <span className={`task-details-value ${isTaskOverdue(task) ? 'task-details-overdue' : ''}`}>
                  {task.deadline ? new Date(task.deadline).toLocaleString('ru-RU') : '—'}
                  {isTaskOverdue(task) && <span className="task-details-overdue-badge"> Просрочено</span>}
                </span>
              </div>
            </div>
          ) : (
            <div className="task-details-edit-form">
              <div className="task-details-form-group">
                <label className="task-details-form-label">Название</label>
                <input
                  type="text"
                  className="task-details-form-input"
                  value={editFormData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              <div className="task-details-form-group">
                <label className="task-details-form-label">Статус</label>
                <select
                  className="task-details-form-select"
                  value={editFormData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  {taskStatuses.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="task-details-form-group">
                <label className="task-details-form-label">Приоритет</label>
                <select
                  className="task-details-form-select"
                  value={editFormData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                >
                  {taskPriorities.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div className="task-details-form-group">
                <label className="task-details-form-label">Дедлайн</label>
                <input
                  type="date"
                  className="task-details-form-input"
                  value={editFormData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="task-details-section">
          <h2 className="task-details-section-title">Описание</h2>
          {!isEditing ? (
            <div className="task-details-description">
              {task.description || 'Описание отсутствует'}
            </div>
          ) : (
            <div className="task-details-form-group">
              <textarea
                className="task-details-form-textarea"
                rows="8"
                value={editFormData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Описание задачи..."
              />
            </div>
          )}
        </div>

        {/* Assignees */}
        <div className="task-details-section">
          <h2 className="task-details-section-title">
            Исполнители
            {isEditing && (
              <button 
                onClick={() => setShowAssigneeModal(true)} 
                className="task-details-add-assignee-button"
              >
                + Добавить
              </button>
            )}
          </h2>
          {editFormData.assigneeIds && editFormData.assigneeIds.length > 0 ? (
            <div className="task-details-assignees">
              {(isEditing ? allProjectMembers : task.assignees)
                .filter(assignee => editFormData.assigneeIds.includes(assignee.memberId))
                .map((assignee) => (
                  <div key={assignee.memberId} className="task-details-assignee-card">
                    <div className="task-details-assignee-info">
                      <div className="task-details-assignee-name">
                        {assignee.firstName} {assignee.lastName}
                      </div>
                      {assignee.role && (
                        <div className="task-details-assignee-role">{assignee.role}</div>
                      )}
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveAssignee(assignee.memberId)}
                        className="task-details-remove-assignee-button"
                        title="Удалить исполнителя"
                      >
                        ×
                      </button>
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
          <h2 className="task-details-section-title">Связи задачи</h2>
          
          {/* Parent Task */}
          <div className="task-details-dependency-group">
            <h3 className="task-details-dependency-group-title">
              Родительская задача
              {isEditing && (
                <button 
                  onClick={() => setShowParentTaskModal(true)} 
                  className="task-details-add-dependency-button"
                >
                  {editFormData.parentTaskId ? 'Изменить' : '+ Добавить'}
                </button>
              )}
            </h3>
            {editFormData.parentTaskId ? (
              <div className="task-details-dependency-card task-details-parent-card">
                <div className="task-details-dependency-content">
                  <div 
                    className="task-details-dependency-title"
                    onClick={!isEditing ? () => navigate(`/tasks/${editFormData.parentTaskId}`) : undefined}
                    style={!isEditing ? { cursor: 'pointer' } : {}}
                  >
                    {allProjectTasks.find(t => t.id === editFormData.parentTaskId)?.title || 
                     task.parentTask?.taskTitle || 
                     'Загрузка...'}
                  </div>
                  {!isEditing && <span className="task-details-dependency-arrow">→</span>}
                  {isEditing && (
                    <button
                      onClick={handleRemoveParentTask}
                      className="task-details-remove-assignee-button"
                      title="Удалить родительскую задачу"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="task-details-placeholder">Родительская задача не назначена</p>
            )}
          </div>

          {/* Child Tasks */}
          {task.dependencies && task.dependencies.length > 0 && (
            <div className="task-details-dependency-group">
              <h3 className="task-details-dependency-group-title">
                Дочерние задачи ({task.dependencies.length})
              </h3>
              <div className="task-details-dependencies">
                {task.dependencies.map((dep) => (
                  <div 
                    key={dep.id} 
                    className="task-details-dependency-card task-details-child-card"
                    onClick={() => navigate(`/tasks/${dep.taskId}`)}
                  >
                    <div className="task-details-dependency-content">
                      <div className="task-details-dependency-title">{dep.taskTitle}</div>
                      <span className="task-details-dependency-arrow">→</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assignee Modal */}
      {showAssigneeModal && (
        <SelectAssigneeModal
          projectId={task.projectId}
          excludeIds={editFormData.assigneeIds}
          onSelect={handleAddAssignee}
          onClose={() => setShowAssigneeModal(false)}
        />
      )}

      {/* Parent Task Modal */}
      {showParentTaskModal && (
        <SelectParentTaskModal
          projectId={task.projectId}
          excludeTaskIds={getExcludedTaskIds()}
          onSelect={handleSelectParentTask}
          onClose={() => setShowParentTaskModal(false)}
        />
      )}
    </div>
  );
}

export default TaskDetailsPage;
