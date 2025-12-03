package com.example.project.controller;

import com.example.project.dto.TaskDto;
import com.example.project.dto.TeamMemberDto;
import com.example.project.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/api/projects/{projectId}/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskDto.CreateResponse createTask(@RequestHeader("Authorization") String authHeader,
                                             @PathVariable("projectId") Long projectId,
                                             @Valid @RequestBody TaskDto.CreateRequest request) {
        return taskService.createTask(authHeader, projectId, request);
    }

    @GetMapping("/api/tasks/{taskId}")
    @ResponseStatus(HttpStatus.OK)
    public TaskDto.TaskDetails getTask(@RequestHeader("Authorization") String authHeader,
                                       @PathVariable("taskId") Long taskId) {
        return taskService.getTaskById(authHeader, taskId);
    }

    @GetMapping("/api/projects/{projectId}/members/options")
    @ResponseStatus(HttpStatus.OK)
    public List<TeamMemberDto.MemberInfo> getProjectMembersForTask(@RequestHeader("Authorization") String authHeader,
                                                                    @PathVariable("projectId") Long projectId) {
        return taskService.getProjectMembers(authHeader, projectId);
    }

    @GetMapping("/api/projects/{projectId}/members/me")
    @ResponseStatus(HttpStatus.OK)
    public Long getMyMemberId(@RequestHeader("Authorization") String authHeader,
                              @PathVariable("projectId") Long projectId) {
        return taskService.getMyMemberId(authHeader, projectId);
    }

    @GetMapping("/api/projects/{projectId}/tasks/options")
    @ResponseStatus(HttpStatus.OK)
    public List<TaskDto.TaskOption> getProjectTasksOptions(@RequestHeader("Authorization") String authHeader,
                                                            @PathVariable("projectId") Long projectId) {
        return taskService.getProjectTaskOptions(authHeader, projectId);
    }
}
