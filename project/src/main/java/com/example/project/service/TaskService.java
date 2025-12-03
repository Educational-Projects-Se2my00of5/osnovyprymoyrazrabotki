package com.example.project.service;

import com.example.project.dto.TaskDto;
import com.example.project.entity.Project;
import com.example.project.entity.Task;
import com.example.project.entity.TeamMember;
import com.example.project.entity.User;
import com.example.project.exception.ForbiddenException;
import com.example.project.exception.NotFoundException;
import com.example.project.repository.ProjectRepository;
import com.example.project.repository.TaskRepository;
import com.example.project.repository.TeamMemberRepository;
import com.example.project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public List<TaskDto.TaskSummary> getProjectTasks(String authHeader, Long projectId) {
        String email = jwtService.extractEmailFromHeader(authHeader);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Проект не найден"));

        // Проверяем, что пользователь - участник проекта
        teamMemberRepository.findByUserAndProject(user, project)
                .orElseThrow(() -> new ForbiddenException("Пользователь не является участником проекта"));

        List<Task> tasks = taskRepository.findByProject(project);
        return tasks.stream().map(this::mapToSummary).collect(Collectors.toList());
    }

    public List<TaskDto.TaskSummary> getMyTasksInProject(String authHeader, Long projectId) {
        String email = jwtService.extractEmailFromHeader(authHeader);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Проект не найден"));

        // Проверяем, что пользователь - участник проекта
        teamMemberRepository.findByUserAndProject(user, project)
                .orElseThrow(() -> new ForbiddenException("Пользователь не является участником проекта"));

        List<Task> tasks = taskRepository.findByProjectAndAssignedUser(project, user);
        return tasks.stream().map(this::mapToSummary).collect(Collectors.toList());
    }

    public List<TaskDto.TaskSummary> getMemberTasks(String authHeader, Long projectId, Long memberId) {
        String email = jwtService.extractEmailFromHeader(authHeader);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Проект не найден"));

        // Проверяем, что пользователь - участник проекта
        teamMemberRepository.findByUserAndProject(user, project)
                .orElseThrow(() -> new ForbiddenException("Пользователь не является участником проекта"));

        TeamMember member = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new NotFoundException("Участник не найден"));

        if (!member.getProject().getId().equals(projectId)) {
            throw new ForbiddenException("Участник не принадлежит данному проекту");
        }

        List<Task> tasks = taskRepository.findByAssignedMember(member);
        return tasks.stream().map(this::mapToSummary).collect(Collectors.toList());
    }

    public List<TaskDto.TaskSummary> getMyTasks(String authHeader) {
        String email = jwtService.extractEmailFromHeader(authHeader);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));

        List<Task> tasks = taskRepository.findByAssignedUser(user);
        return tasks.stream().map(this::mapToSummary).collect(Collectors.toList());
    }

    public TaskDto.AssignedStats getMyTaskStats(String authHeader) {
        String email = jwtService.extractEmailFromHeader(authHeader);
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return new TaskDto.AssignedStats(0L, 0L, 0L);
        }

        long total = taskRepository.countAssignedForUser(user);
        long closed = taskRepository.countCompletedAssignedForUser(user);
        long overdue = taskRepository.countOverdueAssignedForUser(user);

        return new TaskDto.AssignedStats(total, closed, overdue);
    }

    private TaskDto.TaskSummary mapToSummary(Task task) {
        List<TaskDto.AssigneeInfo> assignees = task.getAssignedMembers().stream()
                .map(m -> TaskDto.AssigneeInfo.builder()
                        .memberId(m.getId())
                        .userId(m.getUser().getId())
                        .firstName(m.getUser().getFirstName())
                        .lastName(m.getUser().getLastName())
                        .role(m.getRole())
                        .build())
                .collect(Collectors.toList());

        return TaskDto.TaskSummary.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .deadline(task.getDeadline())
                .status(task.getStatus() != null ? task.getStatus().name() : null)
                .priority(task.getPriority())
                .assignees(assignees)
                .build();
    }
}
