import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject } from '../api';
import './ProjectPage.css';

function ProjectPage() {
  const { id } = useParams();
  const projectId = id;
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const p = await getProject(projectId);
        setProject(p);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки проекта');
      } finally {
        setLoading(false);
      }
    };
    if (projectId) load();
  }, [projectId]);

  return (
    <div className="project-page">
      <div className="dashboard-header">
        <button onClick={() => navigate(-1)} className="dashboard-logout-button">Назад</button>
        <h1 className="dashboard-title">{project ? project.name : 'Проект'}</h1>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : error ? (
        <p className="dashboard-error">{error}</p>
      ) : (
        <div className="project-content">
          <p><strong>Предмет:</strong> {project.subjectName || '—'}</p>
          <p><strong>Описание:</strong> {project.description || '—'}</p>
          <p><strong>Статус:</strong> {project.status || '—'}</p>
          <p><strong>Создан:</strong> {project.createdAt ? new Date(project.createdAt).toLocaleString('ru-RU') : '—'}</p>

          <h3>Участники</h3>
          {project.members && project.members.length > 0 ? (
            <table className="dashboard-table">
              <thead>
                <tr><th>Имя</th><th>Фамилия</th><th>Роль</th></tr>
              </thead>
              <tbody>
                {project.members.map((m) => (
                  <tr key={m.id}>
                    <td>{m.firstName}</td>
                    <td>{m.lastName}</td>
                    <td>{m.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Участников нет</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ProjectPage;
