import { useState } from 'react';
import { updateProject } from '../api/projects';
import { projectStatuses } from '../utils/projectUtils';
import './EditProjectModal.css';

function EditProjectModal({ project, onClose, onSave }) {
  const [name, setName] = useState(project.name || '');
  const [description, setDescription] = useState(project.description || '');
  const [status, setStatus] = useState(project.status || 'PLANNING');
  const [subjectName, setSubjectName] = useState(project.subjectName || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Проверка статуса проекта
  const isArchived = project.status === 'ARCHIVED';
  const canChangeInfo = !isArchived; // Архивированный проект нельзя редактировать вообще

  const handleSave = async () => {
    // Валидация
    if (!name.trim() || name.length < 3 || name.length > 255) {
      setError('Название должно содержать от 3 до 255 символов');
      return;
    }
    if (!subjectName.trim() || subjectName.length < 2 || subjectName.length > 255) {
      setError('Предмет должен содержать от 2 до 255 символов');
      return;
    }
    if (!description.trim()) {
      setError('Описание обязательно');
      return;
    }
    if (description.length > 2000) {
      setError('Описание не должно превышать 2000 символов');
      return;
    }
    if (!status) {
      setError('Необходимо выбрать статус');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const updated = await updateProject(
        project.id,
        name.trim(),
        description,
        subjectName.trim(),
        status
      );
      onSave(updated);
    } catch (err) {
      setError(err.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Редактировать проект</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-form">
          <div className="modal-input-group">
            <label className="modal-label">Название *</label>
            <input
              type="text"
              className="modal-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={3}
              maxLength={255}
              disabled={isArchived}
            />
          </div>
          <div className="modal-input-group">
            <label className="modal-label">Предмет *</label>
            <input
              type="text"
              className="modal-input"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              required
              minLength={2}
              maxLength={255}
              disabled={isArchived}
            />
          </div>
          <div className="modal-input-group">
            <label className="modal-label">Описание *</label>
            <textarea
              className="modal-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={2000}
              required
              disabled={isArchived}
            />
          </div>
          <div className="modal-input-group">
            <label className="modal-label">Статус *</label>
            <select
              className="modal-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              {projectStatuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="modal-error">{error}</p>}
          <div className="modal-buttons">
            <button onClick={onClose} className="modal-cancel-button" disabled={saving}>Отмена</button>
            <button onClick={handleSave} className="modal-save-button" disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProjectModal;
