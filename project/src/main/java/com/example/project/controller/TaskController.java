package com.example.project.controller;

import com.example.project.dto.TaskDto;
import com.example.project.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/api/tasks/my")
    @ResponseStatus(HttpStatus.OK)
    public List<TaskDto.TaskSummary> getMyTasks(@RequestHeader("Authorization") String authHeader) {
        return taskService.getMyTasks(authHeader);
    }

    @GetMapping("/api/tasks/stats")
    @ResponseStatus(HttpStatus.OK)
    public TaskDto.AssignedStats getMyTaskStats(@RequestHeader("Authorization") String authHeader) {
        return taskService.getMyTaskStats(authHeader);
    }

    @GetMapping("/api/projects/{projectId}/tasks")
    @ResponseStatus(HttpStatus.OK)
    public List<TaskDto.TaskSummary> getProjectTasks(@RequestHeader("Authorization") String authHeader,
                                                      @PathVariable("projectId") Long projectId) {
        return taskService.getProjectTasks(authHeader, projectId);
    }

    @GetMapping("/api/projects/{projectId}/tasks/my")
    @ResponseStatus(HttpStatus.OK)
    public List<TaskDto.TaskSummary> getMyTasksInProject(@RequestHeader("Authorization") String authHeader,
                                                          @PathVariable("projectId") Long projectId) {
        return taskService.getMyTasksInProject(authHeader, projectId);
    }

    @GetMapping("/api/projects/{projectId}/tasks/member/{memberId}")
    @ResponseStatus(HttpStatus.OK)
    public List<TaskDto.TaskSummary> getMemberTasks(@RequestHeader("Authorization") String authHeader,
                                                     @PathVariable("projectId") Long projectId,
                                                     @PathVariable("memberId") Long memberId) {
        return taskService.getMemberTasks(authHeader, projectId, memberId);
    }
}
