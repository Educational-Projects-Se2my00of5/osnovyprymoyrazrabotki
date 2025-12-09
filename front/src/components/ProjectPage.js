import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, getProjectTaskStats, removeMemberFromProject, deleteProject } from '../api/projects';
import { createTask, getMyMemberId } from '../api/tasks';
import { getStatusLabel } from '../utils/projectUtils';
import { taskPriorities } from '../utils/taskUtils';
import EditProjectModal from './EditProjectModal';
import AddMemberModal from './AddMemberModal';
import MemberDetailsModal from './MemberDetailsModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import SelectAssigneeModal from './SelectAssigneeModal';
import SelectParentTaskModal from './SelectParentTaskModal';
import './ProjectPage.css';

function ProjectPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [currentMemberId, setCurrentMemberId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSelectAssigneeModal, setShowSelectAssigneeModal] = useState(false);
  const [showSelectParentTaskModal, setShowSelectParentTaskModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  // Состояние для создания задачи
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: taskPriorities[0].value
  });
  const [taskAssignees, setTaskAssignees] = useState([]);
  const [parentTask, setParentTask] = useState(null);
  const [taskCreateMessage, setTaskCreateMessage] = useState({ text: '', type: '' });

  const [taskStats, setTaskStats] = useState({ 
    assigned: { total: 0, closed: 0, overdue: 0 },
    all: { total: 0, closed: 0, overdue: 0 }
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const p = await getProject(projectId);
        setProject(p);
        
        // Получаем memberId текущего пользователя через API
        try {
          const memberId = await getMyMemberId(projectId);
          setCurrentMemberId(memberId);
        } catch (err) {
          console.error('Не удалось получить memberId:', err);
          setCurrentMemberId(null);
        }
        
        const stats = await getProjectTaskStats(projectId);
        setTaskStats(stats);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки проекта');
      } finally {
        setLoading(false);
      }
    };
    if (projectId) load();
  }, [projectId]);

  const handleEditProject = () => {
    setShowEditModal(true);
  };

  const handleAddMember = () => {
    setShowAddMemberModal(true);
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member);
    setShowMemberModal(true);
  };

  const handleDeleteMember = (memberId) => {
    setMemberToDelete(memberId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;
    try {
      await removeMemberFromProject(projectId, memberToDelete);
      const updated = await getProject(projectId);
      setProject(updated);
      setShowDeleteConfirm(false);
      setMemberToDelete(null);
    } catch (err) {
      alert(err.message || 'Ошибка удаления участника');
      setShowDeleteConfirm(false);
      setMemberToDelete(null);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await deleteProject(projectId);
      navigate('/');
    } catch (err) {
      alert(err.message || 'Ошибка удаления проекта');
    }
  };

  const reloadTaskStats = async () => {
    try {
      const stats = await getProjectTaskStats(projectId);
      setTaskStats(stats);
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    if (!newTask.title.trim() || newTask.title.length < 3) {
      setTaskCreateMessage({ text: 'Название должно быть от 3 до 255 символов', type: 'error' });
      return;
    }
    if (!newTask.deadline) {
      setTaskCreateMessage({ text: 'Необходимо указать дедлайн', type: 'error' });
      return;
    }
    if (taskAssignees.length === 0) {
      setTaskCreateMessage({ text: 'Необходимо назначить хотя бы одного исполнителя', type: 'error' });
      return;
    }

    try {
      // Устанавливаем время на 23:59:59 текущего дня
      const deadlineDate = new Date(newTask.deadline);
      deadlineDate.setHours(23, 59, 59, 999);
      
      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description.trim() || null,
        deadline: deadlineDate.toISOString(),
        priority: newTask.priority,
        assigneeIds: taskAssignees.map(a => a.memberId),
        parentTaskId: parentTask ? parentTask.id : null
      };

      await createTask(projectId, taskData);
      
      // Сброс формы
      setNewTask({ title: '', description: '', deadline: '', priority: taskPriorities[0].value });
      setTaskAssignees([]);
      setParentTask(null);
      setTaskCreateMessage({ text: 'Задача успешно создана!', type: 'success' });
      
      // Обновляем статистику
      await reloadTaskStats();
      
      setTimeout(() => setTaskCreateMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setTaskCreateMessage({ text: err.message || 'Ошибка создания задачи', type: 'error' });
    }
  };

  const handleAddAssignee = (member) => {
    if (!taskAssignees.find(a => a.memberId === member.memberId)) {
      setTaskAssignees([...taskAssignees, member]);
    }
    setShowSelectAssigneeModal(false);
  };

  const handleRemoveAssignee = (memberId) => {
    setTaskAssignees(taskAssignees.filter(a => a.memberId !== memberId));
  };

  const handleSelectParentTask = (task) => {
    setParentTask(task);
    setShowSelectParentTaskModal(false);
  };

  if (loading) {
    return (
      <div className="project-page">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-page">
        <p className="dashboard-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="project-page">
      {/* Header */}
      <div className="project-header">
        <h1 className="project-header-title">Проект: {project ? project.name : '—'}</h1>
        <div className="project-header-actions">
          <button onClick={() => setShowDeleteConfirm(true)} className="project-delete-button">Удалить проект</button>
          <button onClick={() => navigate('/')} className="project-back-button">Назад</button>
        </div>
      </div>

      {/* Two-column grid */}
      <div className="project-grid">
        {/* Left column */}
        <div className="project-left">
          {/* Project Info */}
          <div className="project-section">
            <div className="project-section-header">
              <h2 className="project-section-title">Информация о проекте</h2>
              <button onClick={handleEditProject} className="project-edit-button">Редактировать</button>
            </div>
            <div className="project-info">
              <div className="project-info-row">
                <span className="project-label">Предмет:</span>
                <span className="project-value">{project.subjectName || '—'}</span>
              </div>
              <div className="project-info-row">
                <span className="project-label">Описание:</span>
                <span className="project-value project-description">{project.description || '—'}</span>
              </div>
              <div className="project-info-row">
                <span className="project-label">Статус:</span>
                <span className="project-value">{getStatusLabel(project.status)}</span>
              </div>
              <div className="project-info-row">
                <span className="project-label">Создан:</span>
                <span className="project-value">
                  {project.createdAt ? new Date(project.createdAt).toLocaleString('ru-RU') : '—'}
                </span>
              </div>
            </div>
            {/* Action buttons */}
            <div className="project-actions">
              <button 
                className="project-action-button" 
                onClick={() => navigate(`/projects/${projectId}/tasks/${currentMemberId}`)}
              >
                Мои задачи
              </button>
              <button className="project-action-button" onClick={() => navigate(`/projects/${projectId}/tasks`)}>Все задачи</button>
              <button className="project-action-button" onClick={() => navigate(`/projects/${projectId}/gantt`)}>Диаграмма Ганта</button>
            </div>
          </div>

          {/* Members */}
          <div className="project-section">
            <div className="project-section-header">
              <h2 className="project-section-title">Участники</h2>
              <button onClick={handleAddMember} className="project-add-button">Добавить</button>
            </div>
            {project.members && project.members.length > 0 ? (
              <table className="project-table">
                <thead>
                  <tr>
                    <th>Имя</th>
                    <th>Фамилия</th>
                    <th>Роль</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {project.members.map((m) => (
                    <tr key={m.id}>
                      <td onClick={() => handleMemberClick(m)} className="project-table-cell-clickable">{m.firstName}</td>
                      <td onClick={() => handleMemberClick(m)} className="project-table-cell-clickable">{m.lastName}</td>
                      <td onClick={() => handleMemberClick(m)} className="project-table-cell-clickable">{m.role || '—'}</td>
                      <td>
                        <button 
                          className="project-delete-member-button" 
                          onClick={() => handleDeleteMember(m.id)}
                          title="Удалить участника"
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="project-placeholder">Участников нет</p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="project-right">
          {/* Task Stats */}
        <div className="project-section">
          <div className="project-section-header">
            <h3 className="project-section-title">Статистика по задачам</h3>
            </div>
            <table className="project-stats-table">
              <thead>
                <tr>
                  <th>Тип</th>
                  <th>Всего</th>
                  <th>Закрыто</th>
                  <th>Просрочено</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Назначенный</td>
                  <td>
                    <span 
                      className="project-stats-link"
                      onClick={() => navigate(`/projects/${projectId}/tasks/${currentMemberId}?status=all`)}
                    >
                      {taskStats.assigned.total}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="project-stats-link"
                      onClick={() => navigate(`/projects/${projectId}/tasks/${currentMemberId}?status=completed`)}
                    >
                      {taskStats.assigned.closed}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="project-stats-link"
                      onClick={() => navigate(`/projects/${projectId}/tasks/${currentMemberId}?status=overdue`)}
                    >
                      {taskStats.assigned.overdue}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Все</td>
                  <td>
                    <span className="project-stats-link" onClick={() => navigate(`/projects/${projectId}/tasks?status=all`)}>
                      {taskStats.all.total}
                    </span>
                  </td>
                  <td>
                    <span className="project-stats-link" onClick={() => navigate(`/projects/${projectId}/tasks?status=completed`)}>
                      {taskStats.all.closed}
                    </span>
                  </td>
                  <td>
                    <span className="project-stats-link" onClick={() => navigate(`/projects/${projectId}/tasks?status=overdue`)}>
                      {taskStats.all.overdue}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Создание задачи */}
          <div className="project-section">
            <h3 className="project-section-title">Создать задачу</h3>
            <form onSubmit={handleCreateTask} className="project-task-form">
              <div className="project-task-input-group">
                <label className="project-task-label">Название *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                  className="project-task-input"
                  placeholder="Введите название задачи"
                  minLength={3}
                  maxLength={255}
                />
              </div>

              <div className="project-task-input-group">
                <label className="project-task-label">Описание</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="project-task-textarea"
                  placeholder="Опишите задачу (опционально)"
                  rows={3}
                  maxLength={2000}
                />
              </div>

              <div className="project-task-input-group">
                <label className="project-task-label">Дедлайн *</label>
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  required
                  className="project-task-input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="project-task-input-group">
                <label className="project-task-label">Приоритет</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="project-task-input"
                >
                  {taskPriorities.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* Родительская задача */}
              <div className="project-task-input-group">
                <label className="project-task-label">Родительская задача</label>
                {parentTask ? (
                  <div className="project-task-selected-parent">
                    <span className="project-task-parent-title">{parentTask.title}</span>
                    <button
                      type="button"
                      onClick={() => setParentTask(null)}
                      className="project-task-remove-button"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSelectParentTaskModal(true)}
                    className="project-task-add-button"
                  >
                    Выбрать родительскую задачу
                  </button>
                )}
              </div>

              {/* Исполнители */}
              <div className="project-task-input-group">
                <div className="project-task-assignees-header">
                  <label className="project-task-label">Исполнители</label>
                  <button
                    type="button"
                    onClick={() => setShowSelectAssigneeModal(true)}
                    className="project-task-add-assignee-button"
                  >
                    Добавить
                  </button>
                </div>
                {taskAssignees.length > 0 ? (
                  <table className="project-task-assignees-table">
                    <thead>
                      <tr>
                        <th>Имя</th>
                        <th>Фамилия</th>
                        <th>Роль</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taskAssignees.map((assignee) => (
                        <tr key={assignee.memberId}>
                          <td>{assignee.firstName}</td>
                          <td>{assignee.lastName}</td>
                          <td>{assignee.role || '—'}</td>
                          <td>
                            <button
                              type="button"
                              className="project-task-remove-assignee-button"
                              onClick={() => handleRemoveAssignee(assignee.memberId)}
                            >
                              Удалить
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="project-task-placeholder">Исполнителей нет</p>
                )}
              </div>

              <button type="submit" className="project-task-create-button">
                Создать задачу
              </button>

              {taskCreateMessage.text && (
                <div className={`project-task-message ${taskCreateMessage.type === 'error' ? 'error' : 'success'}`}>
                  {taskCreateMessage.text}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Edit Project Modal */}
      {showEditModal && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEditModal(false)}
          onSave={(updated) => {
            setProject(updated);
            setShowEditModal(false);
          }}
        />
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <AddMemberModal
          projectId={projectId}
          onClose={() => setShowAddMemberModal(false)}
          onAdded={async () => {
            setShowAddMemberModal(false);
            // Reload project to get updated members
            try {
              const updated = await getProject(projectId);
              setProject(updated);
            } catch (err) {
              setError(err.message || 'Ошибка обновления проекта');
            }
          }}
        />
      )}

      {/* Member Details Modal */}
      {showMemberModal && selectedMember && (
        <MemberDetailsModal
          projectId={projectId}
          member={selectedMember}
          onClose={() => {
            setShowMemberModal(false);
            setSelectedMember(null);
          }}
          onRoleUpdated={async () => {
            try {
              const updated = await getProject(projectId);
              setProject(updated);
            } catch (err) {
              setError(err.message || 'Ошибка обновления проекта');
            }
          }}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <ConfirmDeleteModal
          onConfirm={memberToDelete ? confirmDeleteMember : handleDeleteProject}
          onClose={() => { setShowDeleteConfirm(false); setMemberToDelete(null); }}
          title="Подтверждение удаления"
          message={memberToDelete ? "Вы уверены, что хотите удалить этого участника?" : "Вы уверены, что хотите удалить этот проект?"}
        />
      )}

      {/* Select Assignee Modal */}
      {showSelectAssigneeModal && (
        <SelectAssigneeModal
          projectId={projectId}
          excludeIds={taskAssignees.map(a => a.memberId)}
          onClose={() => setShowSelectAssigneeModal(false)}
          onSelect={handleAddAssignee}
        />
      )}

      {/* Select Parent Task Modal */}
      {showSelectParentTaskModal && (
        <SelectParentTaskModal
          projectId={projectId}
          onClose={() => setShowSelectParentTaskModal(false)}
          onSelect={handleSelectParentTask}
        />
      )}
    </div>
  );
}

export default ProjectPage;
