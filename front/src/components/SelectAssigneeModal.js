import { useEffect, useState } from 'react';
import { getProjectMembers } from '../api/tasks';
import './SelectAssigneeModal.css';

function SelectAssigneeModal({ projectId, onClose, onSelect, excludeIds = [] }) {
  const [allMembers, setAllMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getProjectMembers(projectId);
        // Фильтруем уже назначенных
        const filtered = data.filter(m => !excludeIds.includes(m.memberId));
        setAllMembers(filtered);
        setFilteredMembers(filtered);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки участников');
      } finally {
        setLoading(false);
      }
    };
    if (projectId) load();
  }, [projectId, excludeIds]);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredMembers(allMembers);
    } else {
      const filtered = allMembers.filter(m => 
        m.firstName.toLowerCase().includes(query) ||
        m.lastName.toLowerCase().includes(query) ||
        (m.role && m.role.toLowerCase().includes(query))
      );
      setFilteredMembers(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, allMembers]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedMembers = filteredMembers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content select-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Выбрать исполнителя</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-body select-modal-body">
          {loading && <p>Загрузка...</p>}
          {error && <p className="modal-error">{error}</p>}
          {!loading && !error && (
            <>
              <input
                type="text"
                className="select-modal-search"
                placeholder="Поиск по имени или роли..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {filteredMembers.length === 0 ? (
                <p className="select-modal-placeholder">Нет доступных участников</p>
              ) : (
                <>
                  <div className="select-modal-list">
                    {displayedMembers.map((member) => (
                      <div
                        key={member.memberId}
                        className="select-modal-item"
                        onClick={() => onSelect(member)}
                      >
                        <div className="select-modal-item-name">
                          {member.firstName} {member.lastName}
                        </div>
                        {member.role && (
                          <div className="select-modal-item-role">{member.role}</div>
                        )}
                      </div>
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="select-modal-pagination">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="pagination-button"
                      >
                        Назад
                      </button>
                      <span className="pagination-info">
                        Страница {currentPage} из {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="pagination-button"
                      >
                        Вперёд
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SelectAssigneeModal;
