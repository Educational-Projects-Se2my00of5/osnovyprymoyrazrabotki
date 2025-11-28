package com.example.project.service;

import com.example.project.dto.ProjectDto;
import com.example.project.entity.Project;
import com.example.project.entity.TeamMember;
import com.example.project.entity.User;
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
}
