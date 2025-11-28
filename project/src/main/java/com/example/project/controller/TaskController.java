package com.example.project.controller;

import com.example.project.dto.TaskStatsDto;
import com.example.project.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/stats")
    @ResponseStatus(HttpStatus.OK)
    public TaskStatsDto.AssignedStats getMyTaskStats(@RequestHeader("Authorization") String authHeader) {
        return taskService.getMyTaskStats(authHeader);
    }
}
