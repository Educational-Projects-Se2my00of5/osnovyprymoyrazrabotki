package com.example.project.service;

import com.example.project.dto.DependencyDto;
import com.example.project.dto.TaskDto;
import com.example.project.dto.TeamMemberDto;
import com.example.project.entity.Dependency;
import com.example.project.entity.Project;
import com.example.project.entity.Task;
import com.example.project.entity.TeamMember;
import com.example.project.entity.User;
import com.example.project.entity.enums.ProjectStatus;
import com.example.project.entity.enums.TaskStatus;
import com.example.project.exception.BadRequestException;
import com.example.project.exception.ForbiddenException;
import com.example.project.exception.NotFoundException;
import com.example.project.mapper.TaskMapper;
import com.example.project.mapper.TeamMemberMapper;
import com.example.project.repository.DependencyRepository;
import com.example.project.repository.ProjectRepository;
import com.example.project.repository.TaskRepository;
import com.example.project.repository.TeamMemberRepository;
import com.example.project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final DependencyRepository dependencyRepository;
    private final DependencyService dependencyService;
    private final JwtService jwtService;
    private final TaskMapper taskMapper;
    private final TeamMemberMapper teamMemberMapper;


    public List<TaskDto.TaskSummary> getProjectTasks(String authHeader, Long projectId) {
        Project project = verifyProjectAccessAndGet(authHeader, projectId);
        List<Task> tasks = taskRepository.findByProject(project);
        return toListTaskSummary(tasks);
    }

    public List<TaskDto.TaskSummary> getMyTasksInProject(String authHeader, Long projectId) {
        User user = getUserFromAuthHeader(authHeader);

        Project project = verifyProjectAccessAndGet(authHeader, projectId);
        List<Task> tasks = taskRepository.findByProjectAndAssignedUser(project, user);
        return toListTaskSummary(tasks);
    }

    public List<TaskDto.TaskSummary> getMemberTasks(String authHeader, Long projectId, Long memberId) {
        Project project = verifyProjectAccessAndGet(authHeader, projectId);


        TeamMember member = project.getTeamMembers().stream()
                .filter(m -> m.getId().equals(memberId))
                .findFirst()
                .orElseThrow(() -> new ForbiddenException("Участник не принадлежит данному проекту"));

        List<Task> tasks = taskRepository.findByAssignedMember(member);
        return toListTaskSummary(tasks);
    }

    public List<TaskDto.TaskSummary> getMyTasks(String authHeader) {
        User user = getUserFromAuthHeader(authHeader);

        List<Task> tasks = taskRepository.findByAssignedUser(user);
        return toListTaskSummary(tasks);
    }

    public TaskDto.AssignedStats getMyTaskStats(String authHeader) {
        User user = getUserFromAuthHeader(authHeader);

        long total = taskRepository.countAssignedForUser(user);
        long closed = taskRepository.countCompletedAssignedForUser(user);
        long overdue = taskRepository.countOverdueAssignedForUser(user);

        return new TaskDto.AssignedStats(total, closed, overdue);
    }

    @Transactional
    public TaskDto.CreateResponse createTask(String authHeader, Long projectId, TaskDto.CreateRequest request) {
        Project project = verifyProjectAccessAndGet(authHeader, projectId);

        // Создаём задачу
        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .deadline(request.getDeadline())
                .priority(request.getPriority())
                .project(project)
                .assignedMembers(new ArrayList<>())
                .dependencies(new ArrayList<>())
                .build();

        // Назначаем исполнителей
        if (request.getAssigneeIds() != null && !request.getAssigneeIds().isEmpty()) {
            List<TeamMember> assignees = teamMemberRepository.findAllById(request.getAssigneeIds());
            // Проверяем, что все участники принадлежат данному проекту
            for (TeamMember member : assignees) {
                if (!member.getProject().getId().equals(projectId)) {
                    throw new ForbiddenException("Участник " + member.getId() + " не принадлежит данному проекту");
                }
            }
            task.setAssignedMembers(assignees);
        }

        Task saved = taskRepository.save(task);

        // Создаём зависимость от родительской задачи, если указана
        DependencyDto.ParentTaskInfo parentTaskInfo = null;
        if (request.getParentTaskId() != null) {
            Task parentTask = taskRepository.findById(request.getParentTaskId())
                    .orElseThrow(() -> new NotFoundException("Родительская задача не найдена"));
            parentTaskInfo = dependencyService.createDependency(saved, parentTask);
        }

        return taskMapper.toCreateResponse(saved, parentTaskInfo);
    }

    public TaskDto.TaskDetails getTaskById(String authHeader, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Задача не найдена"));

        verifyProjectAccessAndGet(authHeader, task.getProject().getId());

        // Заполняем зависимости (дочерние задачи)
        List<DependencyDto.DependencyInfo> dependencies = dependencyService.getChildDependencies(task);

        // Заполняем родительскую задачу
        DependencyDto.ParentTaskInfo parentTaskInfo = dependencyService.getParentTaskInfo(task);

        return taskMapper.toTaskDetails(task, dependencies, parentTaskInfo);
    }

    public List<TeamMemberDto.MemberInfo> getProjectMembers(String authHeader, Long projectId) {
        Project project = verifyProjectAccessAndGet(authHeader, projectId);
        List<TeamMember> members = teamMemberRepository.findAllByProject(project);
        return members.stream().map(teamMemberMapper::toMemberInfo).collect(Collectors.toList());
    }


    // Получение вариантов задач для выпадающего списка
    // id, title
    public List<TaskDto.TaskOption> getProjectTaskOptions(String authHeader, Long projectId) {
        Project project = verifyProjectAccessAndGet(authHeader, projectId);
        List<Task> tasks = taskRepository.findByProject(project);
        return tasks.stream().map(taskMapper::toTaskOption).collect(Collectors.toList());
    }

    // Получение memberId из проекта для текущего пользователя
    public Long getMyMemberId(String authHeader, Long projectId) {
        String email = jwtService.extractEmailFromHeader(authHeader);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Проект не найден"));

        TeamMember member = teamMemberRepository.findByUserAndProject(user, project)
                .orElseThrow(() -> new ForbiddenException("Пользователь не является участником проекта"));

        return member.getId();
    }

    @Transactional
    public TaskDto.TaskDetails updateTask(String authHeader, Long taskId, TaskDto.UpdateRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Задача не найдена"));

        verifyProjectAccessAndGet(authHeader, task.getProject().getId());

        // Проверка изменения статуса с учётом зависимостей
        TaskStatus newStatus = request.getStatus();
        validateStatusChange(task, newStatus);

        // Обновляем поля задачи
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDeadline(request.getDeadline());
        task.setPriority(request.getPriority());
        task.setStatus(newStatus);

        // Валидация дедлайна с учётом существующих зависимостей (родитель/дочерние)
        dependencyService.validateTaskDeadlineUpdate(task);

        // Обновляем исполнителей
        if (request.getAssigneeIds() != null && !request.getAssigneeIds().isEmpty()) {
            List<TeamMember> assignees = teamMemberRepository.findAllById(request.getAssigneeIds());
            // Проверяем, что все участники принадлежат проекту задачи
            for (TeamMember member : assignees) {
                if (!member.getProject().getId().equals(task.getProject().getId())) {
                    throw new ForbiddenException("Участник " + member.getId() + " не принадлежит проекту задачи");
                }
            }
            task.setAssignedMembers(assignees);
        }

        // Обновляем родительскую задачу (зависимость)
        Task newParentTask = null;
        if (request.getParentTaskId() != null) {
            newParentTask = taskRepository.findById(request.getParentTaskId())
                    .orElseThrow(() -> new NotFoundException("Родительская задача не найдена"));
        }
        dependencyService.updateDependency(task, newParentTask);

        Task updated = taskRepository.save(task);

        // Получаем зависимости и родительскую задачу для ответа
        List<DependencyDto.DependencyInfo> dependencies = dependencyService.getChildDependencies(updated);
        DependencyDto.ParentTaskInfo parentTaskInfo = dependencyService.getParentTaskInfo(updated);

        return taskMapper.toTaskDetails(updated, dependencies, parentTaskInfo);
    }

    public void deleteTask(String authHeader, Long taskId) {
        User user = getUserFromAuthHeader(authHeader);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Задача не найдена"));

        // Проверка доступа к проекту
        Project project = task.getProject();
        teamMemberRepository.findByUserAndProject(user, project)
                .orElseThrow(() -> new ForbiddenException("Пользователь не является участником проекта"));

        // Проверка статуса проекта
        if (project.getStatus() == ProjectStatus.COMPLETED || project.getStatus() == ProjectStatus.ARCHIVED) {
            throw new BadRequestException("Невозможно удалить задачу из завершённого или архивированного проекта");
        }

        // Проверка наличия зависимых задач
        List<Dependency> childDependencies = dependencyRepository.findByDependentTask(task);
        if (!childDependencies.isEmpty()) {
            throw new BadRequestException("Невозможно удалить задачу: есть дочерние задачи");
        }

        // Удаляем зависимости, где эта задача является дочерней
        dependencyRepository.findByRequiredTask(task).ifPresent(dependencyRepository::delete);

        // Удаляем задачу
        taskRepository.delete(task);
    }

    /**
     * Проверяет доступ пользователя к проекту
     */
    private Project verifyProjectAccessAndGet(String authHeader, Long projectId) {
        User user = getUserFromAuthHeader(authHeader);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Проект не найден"));

        teamMemberRepository.findByUserAndProject(user, project)
                .orElseThrow(() -> new ForbiddenException("Пользователь не является участником проекта"));

        return project;
    }

    private User getUserFromAuthHeader(String authHeader) {
        String email = jwtService.extractEmailFromHeader(authHeader);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
    }

    /**
     * Валидация изменения статуса задачи
     * Проверяет, что можно изменить статус на указанный
     */
    private void validateStatusChange(Task task, TaskStatus newStatus) {
        if (newStatus == TaskStatus.COMPLETED) {
            // Проверяем, что все дочерние задачи завершены
            // Дочерние задачи - это requiredTask в зависимостях, где task является dependentTask (родителем)
            List<Dependency> childDependencies = dependencyRepository.findByDependentTask(task);
            boolean hasUncompletedChildren = childDependencies.stream()
                    .map(Dependency::getRequiredTask)
                    .anyMatch(child -> child.getStatus() != TaskStatus.COMPLETED);

            if (hasUncompletedChildren) {
                throw new BadRequestException("Невозможно завершить задачу: есть незавершённые дочерние задачи");
            }
        }
    }

    private List<TaskDto.TaskSummary> toListTaskSummary(List<Task> tasks) {
        return tasks.stream()
                .map(task -> taskMapper.toTaskSummary(task, dependencyService.getParentTaskInfo(task)))
                .collect(Collectors.toList());
    }

}
