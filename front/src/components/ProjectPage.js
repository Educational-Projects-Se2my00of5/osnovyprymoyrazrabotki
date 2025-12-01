import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, getProjectTaskStats, removeMemberFromProject, deleteProject } from '../api/projects';
import { getStatusLabel } from '../utils/projectUtils';
import EditProjectModal from './EditProjectModal';
import AddMemberModal from './AddMemberModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import './ProjectPage.css';

function ProjectPage() {
  const { id } = useParams();
  const projectId = id;
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

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
    // TODO: show member stats modal
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
          <button onClick={() => navigate(-1)} className="project-back-button">Назад</button>
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
              <button className="project-action-button" onClick={() => alert('Диаграмма Ганта (в разработке)')}>Диаграмма Ганта</button>
              <button className="project-action-button" onClick={() => alert('Все задачи (в разработке)')}>Все задачи</button>
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
                  <td>{taskStats.assigned.total}</td>
                  <td>{taskStats.assigned.closed}</td>
                  <td>{taskStats.assigned.overdue}</td>
                </tr>
                <tr>
                  <td>Все</td>
                  <td>{taskStats.all.total}</td>
                  <td>{taskStats.all.closed}</td>
                  <td>{taskStats.all.overdue}</td>
                </tr>
              </tbody>
            </table>
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

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <ConfirmDeleteModal
          onConfirm={memberToDelete ? confirmDeleteMember : handleDeleteProject}
          onClose={() => { setShowDeleteConfirm(false); setMemberToDelete(null); }}
          title="Подтверждение удаления"
          message={memberToDelete ? "Вы уверены, что хотите удалить этого участника?" : "Вы уверены, что хотите удалить этот проект?"}
        />
      )}
    </div>
  );
}

export default ProjectPage;
