// Статусы задач
export const taskStatuses = [
  { value: 'NOT_STARTED', label: 'Не начата' },
  { value: 'IN_PROGRESS', label: 'В процессе' },
  { value: 'COMPLETED', label: 'Завершена' },
  { value: 'BLOCKED', label: 'Заблокирована' },
  { value: 'OVERDUE', label: 'Просрочена' }
];

// Получить читаемый статус
export const getStatusLabel = (status) => {
  const found = taskStatuses.find(s => s.value === status);
  return found ? found.label : status;
};

// Фильтры для статусов (для UI)
export const statusFilters = [
  { value: 'all', label: 'Все' },
  { value: 'not_started', label: 'Не начата', status: 'NOT_STARTED' },
  { value: 'in_progress', label: 'В процессе', status: 'IN_PROGRESS' },
  { value: 'completed', label: 'Завершена', status: 'COMPLETED' },
  { value: 'overdue', label: 'Просрочена', status: 'OVERDUE' },
  { value: 'blocked', label: 'Заблокирована', status: 'BLOCKED' }
];

// Варианты сортировки
export const sortOptions = [
  { value: 'deadline', label: 'По дедлайну' },
  { value: 'priority', label: 'По приоритету' },
  { value: 'title', label: 'По названию' }
];

// Функция фильтрации задач по статусу
export const filterTasksByStatus = (tasks, statusFilter) => {
  if (statusFilter === 'all') return tasks;
  
  const filter = statusFilters.find(f => f.value === statusFilter);
  if (!filter || !filter.status) return tasks;
  
  return tasks.filter(task => task.status === filter.status);
};

// Функция сортировки задач
export const sortTasks = (tasks, sortBy) => {
  const sorted = [...tasks];
  
  sorted.sort((a, b) => {
    if (sortBy === 'deadline') {
      return new Date(a.deadline) - new Date(b.deadline);
    } else if (sortBy === 'priority') {
      return (b.priority || 0) - (a.priority || 0);
    } else if (sortBy === 'title') {
      return (a.title || '').localeCompare(b.title || '');
    }
    return 0;
  });
  
  return sorted;
};

// Получить CSS класс для статуса
export const getStatusClassName = (status) => {
  return `task-status-${status?.toLowerCase() || 'unknown'}`;
};
