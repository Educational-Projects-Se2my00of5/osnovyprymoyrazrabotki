package com.example.project.service;

import com.example.project.dto.DependencyDto;
import com.example.project.dto.TaskDto;
import com.example.project.dto.TeamMemberDto;
import com.example.project.entity.Dependency;
import com.example.project.entity.Project;
import com.example.project.entity.Task;
import com.example.project.entity.TeamMember;
import com.example.project.entity.User;
import com.example.project.exception.ForbiddenException;
import com.example.project.exception.NotFoundException;
import com.example.project.mapper.DependencyMapper;
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
    private final JwtService jwtService;
    private final TaskMapper taskMapper;
    private final TeamMemberMapper teamMemberMapper;
    private final DependencyMapper dependencyMapper;

    /**
     * Проверяет доступ пользователя к проекту
     * @return найденный проект
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

    public List<TaskDto.TaskSummary> getProjectTasks(String authHeader, Long projectId) {
        Project project = verifyProjectAccessAndGet(authHeader, projectId);
        List<Task> tasks = taskRepository.findByProject(project);
        return tasks.stream().map(taskMapper::toTaskSummary).collect(Collectors.toList());
    }

    public List<TaskDto.TaskSummary> getMyTasksInProject(String authHeader, Long projectId) {
        User user = getUserFromAuthHeader(authHeader);

        Project project = verifyProjectAccessAndGet(authHeader, projectId);
        List<Task> tasks = taskRepository.findByProjectAndAssignedUser(project, user);
        return tasks.stream().map(taskMapper::toTaskSummary).collect(Collectors.toList());
    }

    public List<TaskDto.TaskSummary> getMemberTasks(String authHeader, Long projectId, Long memberId) {
        Project project = verifyProjectAccessAndGet(authHeader, projectId);


        TeamMember member = project.getTeamMembers().stream()
                .filter(m -> m.getId().equals(memberId))
                .findFirst()
                .orElseThrow(() -> new ForbiddenException("Участник не принадлежит данному проекту"));

        List<Task> tasks = taskRepository.findByAssignedMember(member);
        return tasks.stream().map(taskMapper::toTaskSummary).collect(Collectors.toList());
    }

    public List<TaskDto.TaskSummary> getMyTasks(String authHeader) {
        User user = getUserFromAuthHeader(authHeader);

        List<Task> tasks = taskRepository.findByAssignedUser(user);
        return tasks.stream().map(taskMapper::toTaskSummary).collect(Collectors.toList());
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

            if (!parentTask.getProject().getId().equals(projectId)) {
                throw new ForbiddenException("Родительская задача не принадлежит данному проекту");
            }

            Dependency dependency = Dependency.builder()
                    .requiredTask(parentTask)
                    .dependentTask(saved)
                    .build();

            dependencyRepository.save(dependency);
            parentTaskInfo = dependencyMapper.toParentTaskInfo(parentTask);
        }

        return taskMapper.toCreateResponse(saved, parentTaskInfo);
    }

    public TaskDto.TaskDetails getTaskById(String authHeader, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Задача не найдена"));

        verifyProjectAccessAndGet(authHeader, task.getProject().getId());
    
        // Заполняем зависимости (дочерние задачи) - ищем где task является requiredTask
        List<DependencyDto.DependencyInfo> dependencies = dependencyRepository.findByRequiredTask(task)
                .stream()
                .map(dependencyMapper::toDependencyInfo)
                .collect(Collectors.toList());

        // Заполняем родительскую задачу - ищем где task является dependentTask
        DependencyDto.ParentTaskInfo parentTaskInfo = dependencyRepository.findByDependentTask(task)
                .map(Dependency::getRequiredTask)
                .map(dependencyMapper::toParentTaskInfo)
                .orElse(null);

        return taskMapper.toTaskDetails(task, dependencies, parentTaskInfo);
    }

    public List<TeamMemberDto.MemberInfo> getProjectMembers(String authHeader, Long projectId) {
        Project project = verifyProjectAccessAndGet(authHeader, projectId);
        List<TeamMember> members = teamMemberRepository.findAllByProject(project);
        return members.stream().map(teamMemberMapper::toMemberInfo).collect(Collectors.toList());
    }

    public List<TaskDto.TaskOption> getProjectTaskOptions(String authHeader, Long projectId) {
        Project project = verifyProjectAccessAndGet(authHeader, projectId);
        List<Task> tasks = taskRepository.findByProject(project);
        return tasks.stream().map(taskMapper::toTaskOption).collect(Collectors.toList());
    }

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
}
