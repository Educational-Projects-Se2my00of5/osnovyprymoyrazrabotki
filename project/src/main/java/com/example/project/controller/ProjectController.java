package com.example.project.controller;

import com.example.project.dto.ProjectDto;
import com.example.project.service.ProjectService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
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
}
