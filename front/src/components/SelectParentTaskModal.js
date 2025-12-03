import { useEffect, useState } from 'react';
import { getProjectTasksOptions } from '../api/tasks';
import './SelectParentTaskModal.css';

function SelectParentTaskModal({ projectId, onClose, onSelect, excludeTaskId = null }) {
  const [allTasks, setAllTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getProjectTasksOptions(projectId);
        // Исключаем текущую задачу, если создаётся
        const filtered = excludeTaskId 
          ? data.filter(t => t.id !== excludeTaskId)
          : data;
        setAllTasks(filtered);
        setFilteredTasks(filtered);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки задач');
      } finally {
        setLoading(false);
      }
    };
    if (projectId) load();
  }, [projectId, excludeTaskId]);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredTasks(allTasks);
    } else {
      const filtered = allTasks.filter(t => 
        t.title.toLowerCase().includes(query)
      );
      setFilteredTasks(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, allTasks]);

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedTasks = filteredTasks.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content select-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Выбрать родительскую задачу</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-body select-modal-body">
          {loading && <p>Загрузка...</p>}
          {error && <p className="modal-error">{error}</p>}
          {!loading && !error && (
            <>
              <div className="select-modal-controls">
                <input
                  type="text"
                  className="select-modal-search"
                  placeholder="Поиск по названию задачи..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="select-modal-per-page">
                  <label>Показать:</label>
                  <select 
                    value={itemsPerPage} 
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="select-modal-per-page-select"
                  >
                    <option value={5}>5</option>
                    <option value={8}>8</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>
              {filteredTasks.length === 0 ? (
                <p className="select-modal-placeholder">Нет доступных задач</p>
              ) : (
                <>
                  <div className="select-modal-list">
                    {displayedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="select-task-item"
                        onClick={() => onSelect(task)}
                      >
                        <div className="select-task-item-title">{task.title}</div>
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

export default SelectParentTaskModal;
