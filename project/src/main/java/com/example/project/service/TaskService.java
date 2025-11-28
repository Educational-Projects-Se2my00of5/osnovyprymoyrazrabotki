package com.example.project.service;

import com.example.project.dto.TaskStatsDto;
import com.example.project.entity.User;
import com.example.project.repository.ResultRepository;
import com.example.project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final ResultRepository resultRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public TaskStatsDto.AssignedStats getMyTaskStats(String authHeader) {
        String email = jwtService.extractEmailFromHeader(authHeader);
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return new TaskStatsDto.AssignedStats(0L, 0L, 0L);
        }

        long total = resultRepository.countAssignedForUser(user);
        long closed = resultRepository.countCompletedAssignedForUser(user);
        long overdue = resultRepository.countOverdueAssignedForUser(user);

        return new TaskStatsDto.AssignedStats(total, closed, overdue);
    }
}
