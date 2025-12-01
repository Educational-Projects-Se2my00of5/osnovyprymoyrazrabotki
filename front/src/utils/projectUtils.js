// Утилита для работы со статусами проектов

export const projectStatuses = [
  { value: 'PLANNING', label: 'В Планировании' },
  { value: 'IN_PROGRESS', label: 'В работе' },
  { value: 'COMPLETED', label: 'Завершён' },
  { value: 'ARCHIVED', label: 'Архивирован' }
];

export const getStatusLabel = (status) => {
  const found = projectStatuses.find(s => s.value === status);
  return found ? found.label : status;
};
