package com.example.project.service;

import com.example.project.dto.ResultDto;
import com.example.project.entity.Project;
import com.example.project.entity.Result;
import com.example.project.entity.TeamMember;
import com.example.project.entity.User;
import com.example.project.exception.ForbiddenException;
import com.example.project.exception.NotFoundException;
import com.example.project.repository.ProjectRepository;
import com.example.project.repository.ResultRepository;
import com.example.project.repository.TeamMemberRepository;
import com.example.project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResultService {

    private final ResultRepository resultRepository;
    private final ProjectRepository projectRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public List<ResultDto.ResultSummary> getProjectResults(String authHeader, Long projectId) {
        String email = jwtService.extractEmailFromHeader(authHeader);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Проект не найден"));

        // Проверяем, что пользователь - участник проекта
        teamMemberRepository.findByUserAndProject(user, project)
                .orElseThrow(() -> new ForbiddenException("Пользователь не является участником проекта"));

        List<Result> results = resultRepository.findByProject(project);
        return results.stream().map(this::mapToSummary).collect(Collectors.toList());
    }

    public List<ResultDto.ResultSummary> getMyResultsInProject(String authHeader, Long projectId) {
        String email = jwtService.extractEmailFromHeader(authHeader);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Проект не найден"));

        // Проверяем, что пользователь - участник проекта
        teamMemberRepository.findByUserAndProject(user, project)
                .orElseThrow(() -> new ForbiddenException("Пользователь не является участником проекта"));

        List<Result> results = resultRepository.findByProjectAndAssignedUser(project, user);
        return results.stream().map(this::mapToSummary).collect(Collectors.toList());
    }

    public List<ResultDto.ResultSummary> getMemberResults(String authHeader, Long projectId, Long memberId) {
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

        List<Result> results = resultRepository.findByAssignedMember(member);
        return results.stream().map(this::mapToSummary).collect(Collectors.toList());
    }

    public List<ResultDto.ResultSummary> getMyResults(String authHeader) {
        String email = jwtService.extractEmailFromHeader(authHeader);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));

        List<Result> results = resultRepository.findByAssignedUser(user);
        return results.stream().map(this::mapToSummary).collect(Collectors.toList());
    }

    private ResultDto.ResultSummary mapToSummary(Result result) {
        List<ResultDto.AssigneeInfo> assignees = result.getAssignedMembers().stream()
                .map(m -> ResultDto.AssigneeInfo.builder()
                        .memberId(m.getId())
                        .userId(m.getUser().getId())
                        .firstName(m.getUser().getFirstName())
                        .lastName(m.getUser().getLastName())
                        .role(m.getRole())
                        .build())
                .collect(Collectors.toList());

        return ResultDto.ResultSummary.builder()
                .id(result.getId())
                .title(result.getTitle())
                .description(result.getDescription())
                .deadline(result.getDeadline())
                .status(result.getStatus() != null ? result.getStatus().name() : null)
                .priority(result.getPriority())
                .assignees(assignees)
                .build();
    }
}
