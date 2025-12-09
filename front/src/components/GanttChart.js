import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import './GanttChart.css';

function GanttChart({ tasks, project }) {
  const navigate = useNavigate();

  // Обработчик клика на задачу
  const handleTaskClick = (task) => {
    // Игнорируем пустые строки
    if (task.id === 'empty-start' || task.id === 'empty-end') return;
    navigate(`/tasks/${task.id}`);
  };

  // Кастомный tooltip с днями до дедлайна
  const handleTaskTooltip = (task) => {
    if (task.id === 'empty-start' || task.id === 'empty-end') return '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(task.end);
    deadline.setHours(0, 0, 0, 0);
    
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${task.name}\nДней осталось: ${diffDays}`;
  };

  // Подготовка задач для диаграммы Ганта
  const prepareGanttTasks = () => {
    if (!tasks || tasks.length === 0) return [];

    // Дата создания проекта как начало для всех задач
    const projectStart = project?.createdAt ? new Date(project.createdAt) : new Date();

    // Сортировка задач: сначала задачи без родителя (глобальные), потом с родителем (частные)
    const sortedTasks = [...tasks].sort((a, b) => {
      // Задачи без родителя идут первыми
      if (!a.parentTask && b.parentTask) return -1;
      if (a.parentTask && !b.parentTask) return 1;
      // Если обе без родителя или обе с родителем - сортируем по id
      return a.id - b.id;
    });

    // Создаём карту задач для инверсии зависимостей
    const taskMap = new Map(sortedTasks.map(t => [t.id, t]));

    const ganttTasks = sortedTasks.map((task, index) => {
      const deadline = new Date(task.deadline);
      const startDate = new Date(projectStart);

      // Определение прогресса на основе статуса
      let progress = 0;
      if (task.status === 'COMPLETED') progress = 100;
      // else if (task.status === 'IN_PROGRESS') progress = 50;

      // Определение стиля на основе приоритета
      let styles = {};
      
      if (task.priority === 'HIGH') {
        styles.backgroundColor = '#ef5350';
        styles.progressColor = '#c62828';
      } else if (task.priority === 'NORMAL') {
        styles.backgroundColor = '#ffd54f';
        styles.progressColor = '#f9a825';
      } else if (task.priority === 'LOW') {
        styles.backgroundColor = '#90caf9';
        styles.progressColor = '#1976d2';
      }

      // Инверсия зависимостей: если задача является родителем для других, 
      // то эти дочерние задачи становятся зависимостями
      const childDependencies = sortedTasks
        .filter(t => t.parentTask && t.parentTask.taskId === task.id)
        .map(t => t.id.toString());

      return {
        id: task.id.toString(),
        name: task.title,
        start: startDate,
        end: deadline,
        progress: progress,
        type: 'task',
        dependencies: childDependencies,
        styles: styles
      };
    });

    // Добавляем пустые строки в начало и конец
    const emptyStart = {
      id: 'empty-start',
      name: '',
      start: new Date(projectStart),
      end: new Date(projectStart.getTime() + 1000 * 60 * 60), // +1 час
      progress: 0,
      type: 'task',
      dependencies: [],
      styles: { backgroundColor: 'transparent', progressColor: 'transparent' }
    };

    const emptyEnd = {
      id: 'empty-end',
      name: '',
      start: new Date(projectStart),
      end: new Date(projectStart.getTime() + 1000 * 60 * 60), // +1 час
      progress: 0,
      type: 'task',
      dependencies: [],
      styles: { backgroundColor: 'transparent', progressColor: 'transparent' }
    };

    return [emptyStart, ...ganttTasks, emptyEnd];
  };

  const ganttTasks = prepareGanttTasks();

  if (ganttTasks.length === 0) {
    return (
      <div className="gantt-empty">
        <p>Нет задач для отображения</p>
      </div>
    );
  }

  return (
    <div className="gantt-container">
      <div className="gantt-toolbar">
        <div className="gantt-legend">
          <div className="gantt-legend-item">
            <span className="gantt-legend-color" style={{ background: '#ef5350' }}></span>
            <span>Высокий приоритет</span>
          </div>
          <div className="gantt-legend-item">
            <span className="gantt-legend-color" style={{ background: '#ffd54f' }}></span>
            <span>Средний приоритет</span>
          </div>
          <div className="gantt-legend-item">
            <span className="gantt-legend-color" style={{ background: '#90caf9' }}></span>
            <span>Низкий приоритет</span>
          </div>
        </div>
      </div>
      <div className="gantt-chart-wrapper">
        <Gantt
          tasks={ganttTasks}
          viewMode={ViewMode.Day}
          locale="ru"
          listCellWidth=""
          columnWidth={60}
          rowHeight={45}
          todayColor="rgba(74, 144, 226, 0.3)"
          onClick={handleTaskClick}
          TooltipContent={({ task }) => (
            <div className="gantt-tooltip">
              {handleTaskTooltip(task)}
            </div>
          )}
        />
      </div>
    </div>
  );
}

export default GanttChart;
