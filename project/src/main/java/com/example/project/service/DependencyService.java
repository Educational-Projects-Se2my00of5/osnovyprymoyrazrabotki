package com.example.project.service;

import com.example.project.dto.DependencyDto;
import com.example.project.entity.Dependency;
import com.example.project.entity.Task;
import com.example.project.entity.enums.TaskStatus;
import com.example.project.exception.BadRequestException;
import com.example.project.exception.ForbiddenException;
import com.example.project.mapper.DependencyMapper;
import com.example.project.repository.DependencyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DependencyService {

    private final DependencyRepository dependencyRepository;
    private final DependencyMapper dependencyMapper;

    /**
     * Валидация зависимости между задачами
     * Проверяет все возможные проблемы при создании/обновлении родительской задачи
     * 
     * @param task задача, для которой назначается родитель
     * @param parentTask родительская задача (может быть null для удаления зависимости)
     * @throws ForbiddenException если задачи из разных проектов
     * @throws BadRequestException если возникнет циклическая зависимость, нарушены правила дедлайна или статуса
     */
    public void validateDependency(Task task, Task parentTask) {
        if (parentTask == null || task == null) {
            return;
        }

        // Задачи принадлежат одному проекту
        if (!parentTask.getProject().getId().equals(task.getProject().getId())) {
            throw new ForbiddenException("Родительская задача не принадлежит данному проекту");
        }

        // Задача не может быть родителем самой себя
        if (parentTask.getId().equals(task.getId())) {
            throw new BadRequestException("Задача не может быть родительской для самой себя");
        }

        // Циклические зависимости (родитель не может быть потомком)
        if (canCreateCycle(parentTask, task)) {
            throw new BadRequestException("Невозможно установить родительскую задачу: это создаст циклическую зависимость");
        }

        // Родительская задача не может быть завершена, если дочерняя не завершена
        if (parentTask.getStatus() == TaskStatus.COMPLETED && task.getStatus() != TaskStatus.COMPLETED) {
            throw new BadRequestException("Родительская задача не может быть завершена, пока дочерняя задача не завершена");
        }

        // Проверка дедлайна с конкретным родителем
        if (toLocalDate(task.getDeadline()).isAfter(toLocalDate(parentTask.getDeadline()))) {
            throw new BadRequestException(
                "Дедлайн дочерней задачи не может быть позже дедлайна родительской задачи ("
                + parentTask.getTitle() + ", " + parentTask.getDeadline().format(DateTimeFormatter.ISO_DATE) + ")"
            );
        }

        validateTaskDeadlineUpdate(task);
    }

    /**
     * Создаёт зависимость между задачами (родитель-потомок)
     * @param childTask дочерняя задача (обязательная, required)
     * @param parentTask родительская задача (зависимая, dependent)
     * @return информация о родительской задаче
     */
    @Transactional
    public DependencyDto.ParentTaskInfo createDependency(Task childTask, Task parentTask) {
        validateDependency(childTask, parentTask);

        Dependency dependency = Dependency.builder()
                .requiredTask(childTask)
                .dependentTask(parentTask)
                .build();

        dependencyRepository.save(dependency);
        return dependencyMapper.toParentTaskInfo(parentTask);
    }

    /**
     * Обновляет зависимость для задачи (удаляет старую, создаёт новую если указана)
     * @param task задача для которой обновляется родитель
     * @param newParentTask новая родительская задача (null = удалить зависимость)
     */
    @Transactional
    public void updateDependency(Task task, Task newParentTask) {
        // Удаляем текущую зависимость
        dependencyRepository.findByRequiredTask(task).ifPresent(dependencyRepository::delete);
        
        // Если указана новая родительская задача, создаём зависимость
        if (newParentTask != null) {
            validateDependency(task, newParentTask);
            
            Dependency dependency = Dependency.builder()
                    .requiredTask(task)       
                    .dependentTask(newParentTask) 
                    .build();
            dependencyRepository.save(dependency);
        }
    }

    public List<DependencyDto.DependencyInfo> getChildDependencies(Task task) {
        // Дочерние задачи - это те, для которых текущая задача является родительской dependentTask
        return dependencyRepository.findByDependentTask(task)
                .stream()
                .map(dep -> dependencyMapper.toDependencyInfoFromTask(dep.getRequiredTask()))
                .toList();
    }

    public DependencyDto.ParentTaskInfo getParentTaskInfo(Task task) {
        // Родительская задача - это dependentTask в зависимости где task - requiredTask
        return dependencyRepository.findByRequiredTask(task)
                .map(value -> dependencyMapper.toParentTaskInfo(value.getDependentTask()))
                .orElse(null);
    }

    /**
     * Валидация дедлайна задачи с учётом существующих зависимостей
     * Проверяет, что новый дедлайн не нарушает правила:
     * - Если есть родитель: дедлайн задачи не может быть позже дедлайна родителя
     * - Если есть дочерние: дедлайн задачи не может быть раньше дедлайнов дочерних
     * 
     * @param task задача для которой обновляется дедлайн
     * @throws BadRequestException если новый дедлайн нарушает правила зависимостей
     */
    public void validateTaskDeadlineUpdate(Task task) {
        // Проверяем родительскую задачу
        Optional<Dependency> parentDep = dependencyRepository.findByRequiredTask(task);
        if (parentDep.isPresent()) {
            Task parent = parentDep.get().getDependentTask();
            // Сравниваем только даты, без времени
            if (toLocalDate(task.getDeadline()).isAfter(toLocalDate(parent.getDeadline()))) {
                throw new BadRequestException(
                    "Дедлайн дочерней задачи не может быть позже дедлайна родительской задачи ("
                    + parent.getTitle() + ", " + parent.getDeadline().format(DateTimeFormatter.ISO_DATE) + ")"
                );
            }
        }

        // Проверяем дочерние задачи
        List<Dependency> childDeps = dependencyRepository.findByDependentTask(task);
        for (Dependency dep : childDeps) {
            Task child = dep.getRequiredTask();
            // Сравниваем только даты, без времени
            if (toLocalDate(task.getDeadline()).isBefore(toLocalDate(child.getDeadline()))) {
                throw new BadRequestException(
                    "Дедлайн родительской задачи не может быть раньше дедлайна дочерней задачи ("
                        + child.getTitle() + ", " + child.getDeadline().format(DateTimeFormatter.ISO_DATE) + ")"
                );
            }
        }
    }
    
    /**
     * Преобразует LocalDateTime в LocalDate (удаляет время)
     */
    private java.time.LocalDate toLocalDate(LocalDateTime dateTime) {
        return dateTime.toLocalDate();
    }
    

    /**
     * Проверяет, не создаст ли назначение parentTask родителем для childTask циклическую зависимость
     * Рекурсивно проверяет всех потомков childTask
     */
    private boolean canCreateCycle(Task potentialParent, Task currentTask) {
        if (potentialParent.getId().equals(currentTask.getId())) {
            return true;
        }

        // Получаем всех потомков текущей задачи (где currentTask - dependentTask, т.е. родитель)
        List<Dependency> childDependencies = dependencyRepository.findByDependentTask(currentTask);

        // Проверяем каждого потомка рекурсивно
        for (Dependency dep : childDependencies) {
            if (canCreateCycle(potentialParent, dep.getRequiredTask())) {
                return true;
            }
        }

        return false;
    }
}
