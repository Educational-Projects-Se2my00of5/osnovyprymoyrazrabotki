package com.example.project.service;

import com.example.project.dto.ProjectDto;
import com.example.project.entity.Project;
import com.example.project.entity.TeamMember;
import com.example.project.entity.User;
import com.example.project.exception.ForbiddenException;
import com.example.project.exception.NotFoundException;
import com.example.project.repository.ProjectRepository;
import com.example.project.repository.TeamMemberRepository;
import com.example.project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public List<ProjectDto.ProjectSummary> getMyProjects(String authHeader) {
        String email = jwtService.extractEmailFromHeader(authHeader);
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return List.of();

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
        if (user == null) return null;

        var project = Project.builder()
        .name(req.getName())
        .description(req.getDescription())
        .subjectName(req.getSubjectName())
        .build();

        var saved = projectRepository.save(project);

        // Добавляем создателя как владельца проекта
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
                .build();
    }

    public ProjectDto.ProjectDetails getProjectDetails(String authHeader, Long projectId) {
        var opt = projectRepository.findById(projectId);
        if (opt.isEmpty()) return null;

        var project = opt.get();

        String myRole = null;
        String email = jwtService.extractEmailFromHeader(authHeader);
        var user = userRepository.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
        
        var membership = teamMemberRepository.findByUserAndProject(user, project);
        if (membership.isPresent()) myRole = membership.get().getRole();
        else throw new ForbiddenException("Пользователь не является участником проекта");

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
            .members(members)
            .myRole(myRole)
            .build();
    }
}
