package com.example.project.service;

import com.example.project.dto.ProjectDto;
import com.example.project.dto.UserDto;
import com.example.project.entity.Project;
import com.example.project.entity.Task;
import com.example.project.entity.TeamMember;
import com.example.project.entity.User;
import com.example.project.entity.enums.ProjectStatus;
import com.example.project.entity.enums.TaskStatus;
import com.example.project.exception.BadRequestException;
import com.example.project.exception.ForbiddenException;
import com.example.project.exception.NotFoundException;
import com.example.project.repository.ProjectRepository;
import com.example.project.repository.TaskRepository;
import com.example.project.repository.TeamMemberRepository;
import com.example.project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final JwtService jwtService;

    public List<ProjectDto.ProjectSummary> getMyProjects(String authHeader) {
        String email = jwtService.extractEmailFromHeader(authHeader);
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null)
            return List.of();

        List<TeamMember> memberships = teamMemberRepository.findByUser(user);

        return memberships.stream().map(m -> {
            var p = m.getProject();
            return ProjectDto.ProjectSummary.builder()
                    .id(p.getId())
                    .name(p.getName())
                    .subjectName(p.getSubjectName())
                    .status(p.getStatus() != null ? p.getStatus().name() : null)
                    .role(m.getRole())
                    .createdAt(p.getCreatedDate())
                    .build();
        }).collect(Collectors.toList());
    }

    public ProjectDto.ProjectSummary createProject(String authHeader, ProjectDto.CreateRequest req) {
        String email = jwtService.extractEmailFromHeader(authHeader);
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null)
            return null;

        var project = Project.builder()
                .name(req.getName())
                .description(req.getDescription())
                .subjectName(req.getSubjectName())
                .deadline(req.getDeadline())
                .build();

        var saved = projectRepository.save(project);

        // Добавляем создателя как участника проекта
        var member = TeamMember.builder()
                .user(user)
                .project(saved)
                .role("Создатель")
                .joinedDate(LocalDateTime.now())
                .build();
        teamMemberRepository.save(member);

        return ProjectDto.ProjectSummary.builder()
                .id(saved.getId())
                .name(saved.getName())
                .subjectName(saved.getSubjectName())
                .status(saved.getStatus().name())
                .role(member.getRole())
                .createdAt(saved.getCreatedDate())
                .deadline(saved.getDeadline())
                .build();
    }

    public ProjectDto.ProjectDetails getProjectDetails(String authHeader, Long projectId) {
        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Проект не найден"));

        String myRole = null;
        String email = jwtService.extractEmailFromHeader(authHeader);
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));

        teamMemberRepository.findByUserAndProject(user, project).orElseThrow(() -> {
            throw new ForbiddenException("Пользователь не является участником проекта");
        });

        var members = project.getTeamMembers().stream().map(m -> {
            var u = m.getUser();
            return ProjectDto.TeamMemberInfo.builder()
                    .id(m.getId())
                    .userId(u.getId())
                    .firstName(u.getFirstName())
                    .lastName(u.getLastName())
                    .role(m.getRole())
                    .build();
        }).toList();

        return ProjectDto.ProjectDetails.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .subjectName(project.getSubjectName())
                .status(project.getStatus() != null ? project.getStatus().name() : null)
                .createdAt(project.getCreatedDate())
                .deadline(project.getDeadline())
                .members(members)
                .myRole(myRole)
                .build();
    }

    public Page<UserDto.UserInfo> getAvailableUsers(String authHeader, Long projectId, int page, int size) {
        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Проект не найден"));

        String email = jwtService.extractEmailFromHeader(authHeader);
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));

        // Проверяем, что пользователь - участник проекта
        teamMemberRepository.findByUserAndProject(user, project).orElseThrow(() -> {
            throw new ForbiddenException("Пользователь не является участником проекта");
        });

        // Получаем ID всех участников проекта
        Set<Long> memberIds = project.getTeamMembers().stream()
                .map(m -> m.getUser().getId())
                .collect(Collectors.toSet());

        // Получаем всех пользователей и фильтруем тех, кто не в проекте
        List<User> allUsers = userRepository.findAll();
        List<UserDto.UserInfo> availableUsers = allUsers.stream()
                .filter(u -> !memberIds.contains(u.getId()))
                .map(u -> UserDto.UserInfo.builder()
                        .id(String.valueOf(u.getId()))
                        .firstName(u.getFirstName())
                        .lastName(u.getLastName())
                        .email(u.getEmail())
                        .registrationDate(u.getRegistrationDate())
                        .build())
                .toList();

        // Применяем пагинацию вручную
        int start = page * size;
        int end = Math.min(start + size, availableUsers.size());

        if (start >= availableUsers.size()) {
            return new PageImpl<>(List.of(), PageRequest.of(page, size), availableUsers.size());
        }

        List<UserDto.UserInfo> pageContent = availableUsers.subList(start, end);
        return new PageImpl<>(pageContent, PageRequest.of(page, size), availableUsers.size());
    }

    public ProjectDto.TaskStats getProjectTaskStats(String authHeader, Long projectId) {
        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Проект не найден"));

        String email = jwtService.extractEmailFromHeader(authHeader);
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));

        // Проверяем, что пользователь - участник проекта
        teamMemberRepository.findByUserAndProject(user, project).orElseThrow(() -> {
            throw new ForbiddenException("Пользователь не является участником проекта");
        });

        // Статистика для назначенных мне
        long assignedTotal = taskRepository.countAssignedForUserInProject(project, user);
        long assignedClosed = taskRepository.countCompletedAssignedForUserInProject(project, user);
        long assignedOverdue = taskRepository.countOverdueAssignedForUserInProject(project, user);

        // Статистика для всех в проекте
        long allTotal = taskRepository.countByProject(project);
        long allClosed = taskRepository.countCompletedByProject(project);
        long allOverdue = taskRepository.countOverdueByProject(project);

        return ProjectDto.TaskStats.builder()
                .assigned(ProjectDto.TaskTypeStats.builder()
                        .total(assignedTotal)
                        .closed(assignedClosed)
                        .overdue(assignedOverdue)
                        .build())
                .all(ProjectDto.TaskTypeStats.builder()
                        .total(allTotal)
                        .closed(allClosed)
                        .overdue(allOverdue)
                        .build())
                .build();
    }

    public ProjectDto.ProjectDetails updateProject(String authHeader, Long projectId, ProjectDto.UpdateRequest req) {
        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Проект не найден"));

        String email = jwtService.extractEmailFromHeader(authHeader);
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));

        // Проверяем права (только создатель или владелец может редактировать)
        teamMemberRepository.findByUserAndProject(user, project).orElseThrow(() -> {
            throw new ForbiddenException("Пользователь не является участником проекта");
        });

        // Нельзя редактировать архивированный проект
        if (project.getStatus() == ProjectStatus.ARCHIVED) {
            throw new BadRequestException("Невозможно редактировать архивированный проект");
        }

        ProjectStatus newStatus = ProjectStatus.valueOf(req.getStatus());

        // Проверка при переводе в COMPLETED
        if (newStatus == ProjectStatus.COMPLETED) {
            List<Task> rootTasks = taskRepository.findRootTasksByProject(project);
            List<Task> incompleteTasks = rootTasks.stream()
                    .filter(t -> t.getStatus() != TaskStatus.COMPLETED)
                    .toList();

            if (!incompleteTasks.isEmpty()) {
                String titles = incompleteTasks.stream()
                        .map(Task::getTitle)
                        .collect(Collectors.joining(", "));
                throw new BadRequestException(
                        "Невозможно завершить проект: есть незавершённые корневые задачи: " + titles
                );
            }
        }

        // Проверка при архивации - можно архивировать только завершённый проект
        if (newStatus == ProjectStatus.ARCHIVED && project.getStatus() != ProjectStatus.COMPLETED) {
            throw new BadRequestException("Архивировать можно только завершённый проект");
        }

        project.setName(req.getName());
        project.setDescription(req.getDescription());
        project.setSubjectName(req.getSubjectName());
        project.setDeadline(req.getDeadline());
        project.setStatus(newStatus);
        projectRepository.save(project);

        // Возвращаем обновленные детали
        return getProjectDetails(authHeader, project.getId());
    }

    public void addMemberToProject(String authHeader, Long projectId, ProjectDto.AddMemberRequest req) {
        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Проект не найден"));

        String email = jwtService.extractEmailFromHeader(authHeader);
        var currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));

        // Проверяем права (только создатель или владелец может добавлять участников)
        teamMemberRepository.findByUserAndProject(currentUser, project).orElseThrow(() -> {
            throw new ForbiddenException("Пользователь не является участником проекта");
        });

        var newUser = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new NotFoundException("Пользователь для добавления не найден"));

        // Проверяем, что пользователь еще не участник
        var existing = teamMemberRepository.findByUserAndProject(newUser, project);
        if (existing.isPresent()) {
            throw new BadRequestException("Пользователь уже является участником проекта");
        }

        String role = (req.getRole() != null && !req.getRole().isBlank()) ? req.getRole() : "Участник";

        var newMember = TeamMember.builder()
                .user(newUser)
                .project(project)
                .role(role)
                .joinedDate(LocalDateTime.now())
                .build();

        teamMemberRepository.save(newMember);
    }

    @Transactional
    public void removeMemberFromProject(String authHeader, Long projectId, Long memberId) {
        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Проект не найден"));

        String email = jwtService.extractEmailFromHeader(authHeader);
        var currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));

        // Проверяем права
        teamMemberRepository.findByUserAndProject(currentUser, project)
                .orElseThrow(() -> new ForbiddenException("Пользователь не является участником проекта"));

        var memberToRemove = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new NotFoundException("Участник не найден"));

        if (!memberToRemove.getProject().getId().equals(projectId)) {
            throw new BadRequestException("Участник не принадлежит данному проекту");
        }

        // Нельзя удалить последнего участника
        if (project.getTeamMembers().size() <= 1) {
            throw new BadRequestException("Нельзя удалить последнего участника проекта");
        }

        // Проверяем, является ли участник единственным исполнителем в каких-либо задачах
        List<Task> tasksWithOnlyThisMember = memberToRemove.getAssignedTasks().stream()
                .filter(task -> task.getAssignedMembers().size() == 1)
                .toList();

        if (!tasksWithOnlyThisMember.isEmpty()) {
            String taskTitles = tasksWithOnlyThisMember.stream()
                    .map(Task::getTitle)
                    .collect(Collectors.joining(", "));
            throw new BadRequestException(
                    "Невозможно удалить участника: он является единственным исполнителем в задачах: " + taskTitles
            );
        }

        for (Task task : new ArrayList<>(memberToRemove.getAssignedTasks())) {
            task.getAssignedMembers().remove(memberToRemove);
            taskRepository.save(task); // Сохраняем изменения в задаче
        }

        // Очищаем список задач у участника
        memberToRemove.getAssignedTasks().clear();

        project.getTeamMembers().remove(memberToRemove);
        projectRepository.save(project);

        // Теперь можно безопасно удалить участника
        teamMemberRepository.delete(memberToRemove);
        teamMemberRepository.flush();
//        log.info(teamMemberRepository.findByUserAndProject(currentUser, project).isPresent()+"");
    }

    public void updateMemberRole(String authHeader, Long projectId, Long memberId, String newRole) {
        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Проект не найден"));

        String email = jwtService.extractEmailFromHeader(authHeader);
        var currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));

        // Проверяем права
        teamMemberRepository.findByUserAndProject(currentUser, project).orElseThrow(() -> {
            throw new ForbiddenException("Пользователь не является участником проекта");
        });

        var member = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new NotFoundException("Участник не найден"));

        if (!member.getProject().getId().equals(projectId)) {
            throw new BadRequestException("Участник не принадлежит данному проекту");
        }

        member.setRole(newRole != null && !newRole.isBlank() ? newRole : "Участник");
        teamMemberRepository.save(member);
    }

    public void deleteProject(String authHeader, Long projectId) {
        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Проект не найден"));

        String email = jwtService.extractEmailFromHeader(authHeader);
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));

        // Проверяем, что пользователь - участник проекта
        teamMemberRepository.findByUserAndProject(user, project).orElseThrow(() -> {
            throw new ForbiddenException("Пользователь не является участником проекта");
        });

        projectRepository.delete(project);
    }
}
