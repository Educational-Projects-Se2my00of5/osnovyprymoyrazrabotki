import { useState, useEffect } from 'react';
import { updateMemberRole } from '../api/results';
import { getMemberResults } from '../api/results';
import { useNavigate } from 'react-router-dom';
import { getStatusLabel } from '../utils/taskUtils';
import './MemberDetailsModal.css';

function MemberDetailsModal({ projectId, member, onClose, onRoleUpdated }) {
  const navigate = useNavigate();
  const [role, setRole] = useState(member.role || '');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      try {
        const data = await getMemberResults(projectId, member.id);
        setTasks(data);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки задач');
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, [projectId, member.id]);

  const handleSaveRole = async () => {
    setSaving(true);
    setSuccessMessage('');
    try {
      await updateMemberRole(projectId, member.id, role);
      onRoleUpdated();
      setSuccessMessage('Роль успешно обновлена');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      setError(err.message || 'Ошибка обновления роли');
    } finally {
      setSaving(false);
    }
  };

  const handleViewAllTasks = () => {
    navigate(`/projects/${projectId}/tasks/${member.id}`);
    onClose();
  };

  // Подсчёт статистики
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const overdueTasks = tasks.filter(t => t.status === 'OVERDUE').length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Участник: {member.firstName} {member.lastName}</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-form">
          {/* Role edit */}
          <div className="modal-input-group">
            <label className="modal-label">Роль</label>
            <div className="member-role-input-group">
              <input
                type="text"
                className="modal-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Введите роль..."
              />
              <button 
                onClick={handleSaveRole} 
                className="modal-button"
                disabled={saving}
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>

          {successMessage && (
            <div className="member-success-message">{successMessage}</div>
          )}

          {/* Task Statistics */}
          <div className="member-tasks-section">
            <div className="member-tasks-header">
              <h4 className="modal-section-title">Статистика по задачам</h4>
              <button onClick={handleViewAllTasks} className="modal-link-button">
                Посмотреть все задачи →
              </button>
            </div>
            {loading ? (
              <p>Загрузка статистики...</p>
            ) : error ? (
              <p className="modal-error">{error}</p>
            ) : (
              <table className="project-stats-table">
                <thead>
                  <tr>
                    <th>Всего</th>
                    <th>Завершено</th>
                    <th>Просрочено</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span className="project-stats-link" onClick={handleViewAllTasks}>
                        {totalTasks}
                      </span>
                    </td>
                    <td>
                      <span className="project-stats-link" onClick={() => { 
                        navigate(`/projects/${projectId}/tasks/${member.id}?status=completed`); 
                        onClose(); 
                      }}>
                        {completedTasks}
                      </span>
                    </td>
                    <td>
                      <span className="project-stats-link" onClick={() => { 
                        navigate(`/projects/${projectId}/tasks/${member.id}?status=overdue`); 
                        onClose(); 
                      }}>
                        {overdueTasks}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberDetailsModal;
