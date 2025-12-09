import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import './GanttChart1.css';

function GanttChart1({ tasks, project }) {
  const navigate = useNavigate();
  const ganttContainer = useRef(null);

  useEffect(() => {
    if (!ganttContainer.current) return;

    // Очищаем перед каждой инициализацией
    gantt.clearAll();

    // Настройка конфигурации
    gantt.config.date_format = '%Y-%m-%d %H:%i:%s';
    gantt.config.scale_unit = 'day';
    gantt.config.step = 1;
    gantt.config.date_scale = '%d %M';
    gantt.config.subscales = [];
    gantt.config.readonly = true;
    gantt.config.show_progress = true;
    gantt.config.order_branch = true;
    gantt.config.order_branch_free = true;
    gantt.config.show_grid = false; // Скрываем левую таблицу
    gantt.config.highlight_critical_path = false;
    gantt.config.row_height = 50; // Увеличенная высота строк
    gantt.config.task_height = 30; // Высота полоски задачи (меньше чем высота строки)
    gantt.config.duration_unit = 'day';
    gantt.config.work_time = true;
    
    // Подсветка сегодняшнего дня
    gantt.config.highlight_today_period = true;
    gantt.config.today = new Date();
    
    // Включаем tooltip
    gantt.plugins({
      tooltip: true,
      marker: true
    });

    // Обработчик клика на задачу
    const clickHandler = gantt.attachEvent('onTaskClick', function(id, e) {
      navigate(`/tasks/${id}`);
      return true;
    });

    // Кастомный tooltip с правильным расчетом дней
    gantt.templates.tooltip_text = function(start, end, task) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadline = new Date(end);
      deadline.setHours(0, 0, 0, 0);
      
      const diffTime = deadline.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return `<b>${task.text}</b><br/>Дней осталось: ${diffDays}`;
    };

    // Цвета задач по приоритету
    gantt.templates.task_class = function(start, end, task) {
      let classes = [];
      
      // Приоритет
      if (task.priority === 'HIGH') classes.push('gantt-task-high');
      if (task.priority === 'NORMAL') classes.push('gantt-task-normal');
      if (task.priority === 'LOW') classes.push('gantt-task-low');
      
      // Проверка на просроченность
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadline = new Date(end);
      deadline.setHours(0, 0, 0, 0);
      
      if (deadline < today && task.progress < 1) {
        classes.push('gantt-task-overdue');
      }
      
      return classes.join(' ');
    };

    // Инициализация
    gantt.init(ganttContainer.current);

    // Подготовка данных
    if (tasks && tasks.length > 0 && project) {
      const projectStart = project?.createdAt ? new Date(project.createdAt) : new Date();
      
      // Сортировка: глобальные задачи первыми
      const sortedTasks = [...tasks].sort((a, b) => {
        if (!a.parentTask && b.parentTask) return -1;
        if (a.parentTask && !b.parentTask) return 1;
        return a.id - b.id;
      });

      const ganttData = {
        data: [],
        links: []
      };

      // Вычисляем уровень вложенности для каждой задачи
      const getDepthLevel = (task, allTasks, memo = {}) => {
        if (memo[task.id] !== undefined) return memo[task.id];
        
        if (!task.parentTask) {
          memo[task.id] = 0;
          return 0;
        }
        
        const parent = allTasks.find(t => t.id === task.parentTask.taskId);
        if (!parent) {
          memo[task.id] = 1;
          return 1;
        }
        
        const level = getDepthLevel(parent, allTasks, memo) + 1;
        memo[task.id] = level;
        return level;
      };

      // Добавляем задачи
      sortedTasks.forEach((task) => {
        const startDate = new Date(projectStart);
        const endDate = new Date(task.deadline);
        
        // Устанавливаем время на начало дня для корректного расчета
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        
        const duration = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));

        ganttData.data.push({
          id: task.id.toString(),
          text: task.title,
          start_date: gantt.date.date_to_str('%Y-%m-%d 00:00:00')(startDate),
          end_date: gantt.date.date_to_str('%Y-%m-%d 23:59:59')(endDate),
          progress: task.status === 'COMPLETED' ? 1 : (task.status === 'IN_PROGRESS' ? 0.5 : 0),
          priority: task.priority,
          readonly: true,
          depth: getDepthLevel(task, sortedTasks) // Сохраняем уровень вложенности
        });

        // Добавляем связи с чередующимися типами в зависимости от уровня
        if (task.parentTask) {
          const depth = getDepthLevel(task, sortedTasks);
          // Чередуем типы связей: 0, 1, 2, 3 по модулю уровня вложенности
          // 0 = finish-to-start, 1 = start-to-start, 2 = finish-to-finish, 3 = start-to-finish
          const linkType = (depth % 3).toString();
          
          ganttData.links.push({
            id: `link-${task.id}-${task.parentTask.taskId}`,
            source: task.id.toString(),
            target: task.parentTask.taskId.toString(),
            type: linkType
          });
        }
      });

      gantt.parse(ganttData);
      
      // Добавляем маркер текущей даты после парсинга данных
      if (gantt.addMarker) {
        gantt.addMarker({
          start_date: new Date(),
          css: "today",
          text: "",
          title: "Сегодня: " + gantt.date.date_to_str(gantt.config.date_format)(new Date())
        });
      }
      
      // Автоматическая высота контейнера
      const taskCount = sortedTasks.length;
      const calculatedHeight = Math.max(200, taskCount * 50 + 80);
      ganttContainer.current.style.height = calculatedHeight + 'px';
    }

    // Cleanup при размонтировании
    return () => {
      gantt.detachEvent(clickHandler);
      gantt.clearAll();
    };
  }, [tasks, project, navigate]);

  if (!tasks || tasks.length === 0) {
    return (
      <div className="gantt-empty">
        <p>Нет задач для отображения</p>
      </div>
    );
  }

  return (
    <div className="gantt-container-dhtmlx">
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
      <div ref={ganttContainer} style={{ width: '100%' }}></div>
    </div>
  );
}

export default GanttChart1;
