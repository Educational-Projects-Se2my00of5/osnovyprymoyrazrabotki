package com.example.project.controller;

import com.example.project.dto.ProjectDto;
import com.example.project.dto.UserDto;
import com.example.project.service.ProjectService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<ProjectDto.ProjectSummary> getMyProjects(@RequestHeader("Authorization") String authHeader) {
        return projectService.getMyProjects(authHeader);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectDto.ProjectSummary createProject(@RequestHeader("Authorization") String authHeader,
                                                   @RequestBody @Valid ProjectDto.CreateRequest request) {
        return projectService.createProject(authHeader, request);
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ProjectDto.ProjectDetails getProject(@RequestHeader("Authorization") String authHeader,
                                                @PathVariable("id") Long id) {
        return projectService.getProjectDetails(authHeader, id);
    }

    @GetMapping("/{id}/available-users")
    @ResponseStatus(HttpStatus.OK)
    public Page<UserDto.UserInfo> getAvailableUsers(@RequestHeader("Authorization") String authHeader,
                                                     @PathVariable("id") Long id,
                                                     @RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "20") int size) {
        return projectService.getAvailableUsers(authHeader, id, page, size);
    }

    @GetMapping("/{id}/tasks/stats")
    @ResponseStatus(HttpStatus.OK)
    public ProjectDto.TaskStats getProjectTaskStats(@RequestHeader("Authorization") String authHeader,
                                                     @PathVariable("id") Long id) {
        return projectService.getProjectTaskStats(authHeader, id);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ProjectDto.ProjectDetails updateProject(@RequestHeader("Authorization") String authHeader,
                                                   @PathVariable("id") Long id,
                                                   @RequestBody @Valid ProjectDto.UpdateRequest request) {
        return projectService.updateProject(authHeader, id, request);
    }

    @PostMapping("/{id}/members")
    @ResponseStatus(HttpStatus.CREATED)
    public void addMemberToProject(@RequestHeader("Authorization") String authHeader,
                                   @PathVariable("id") Long id,
                                   @RequestBody @Valid ProjectDto.AddMemberRequest request) {
        projectService.addMemberToProject(authHeader, id, request);
    }

    @DeleteMapping("/{id}/members/{memberId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMemberFromProject(@RequestHeader("Authorization") String authHeader,
                                       @PathVariable("id") Long id,
                                       @PathVariable("memberId") Long memberId) {
        projectService.removeMemberFromProject(authHeader, id, memberId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProject(@RequestHeader("Authorization") String authHeader,
                             @PathVariable("id") Long id) {
        projectService.deleteProject(authHeader, id);
    }
}
