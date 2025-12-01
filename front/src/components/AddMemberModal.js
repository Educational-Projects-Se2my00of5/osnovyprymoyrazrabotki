import { useState, useEffect } from 'react';
import { addMemberToProject, getAvailableUsers } from '../api/projects';
import './AddMemberModal.css';

function AddMemberModal({ projectId, onClose, onAdded }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const response = await getAvailableUsers(projectId, currentPage, pageSize);
        setUsers(response.content);
        setFilteredUsers(response.content);
        setTotalPages(response.totalPages);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки пользователей');
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [projectId, currentPage, pageSize]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (u) =>
            u.firstName.toLowerCase().includes(q) ||
            u.lastName.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, users]);

  const handleAdd = async (userId) => {
    try {
      await addMemberToProject(projectId, userId);
      onAdded();
    } catch (err) {
      setError(err.message || 'Ошибка добавления');
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Добавить участника</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-form">
          <div className="modal-input-group">
            <label className="modal-label">Поиск по имени или фамилии</label>
            <input
              type="text"
              className="modal-input"
              placeholder="Введите имя или фамилию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="pagination-controls">
            <label>Показывать: 
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </label>
          </div>
          {loading ? (
            <p>Загрузка...</p>
          ) : error ? (
            <p className="modal-error">{error}</p>
          ) : filteredUsers.length === 0 ? (
            <p className="project-placeholder">Нет доступных пользователей</p>
          ) : (
            <>
              <table className="project-table">
                <thead>
                  <tr>
                    <th>Имя</th>
                    <th>Фамилия</th>
                    <th>Email</th>
                    <th>Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>{u.firstName}</td>
                      <td>{u.lastName}</td>
                      <td>{u.email}</td>
                      <td>
                        <button
                          className="project-add-member-button"
                          onClick={() => handleAdd(u.id)}
                        >
                          Добавить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination-controls">
                <button onClick={handlePrevPage} disabled={currentPage === 0}>Предыдущая</button>
                <span>Страница {currentPage + 1} из {totalPages}</span>
                <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1}>Следующая</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddMemberModal;
