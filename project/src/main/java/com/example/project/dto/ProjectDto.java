package com.example.project.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class ProjectDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectSummary {
        private Long id;
        private String name;
        private String subjectName;
        private String status;
        private String role; // роль текущего пользователя в проекте
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamMemberInfo {
        private Long id;
        private Long userId;
        private String firstName;
        private String lastName;
        private String role;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectDetails {
        private Long id;
        private String name;
        private String description;
        private String subjectName;
        private String status;
        private LocalDateTime createdAt;
        private List<TeamMemberInfo> members;
        private String myRole;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private String name;
        private String description;
        private String subjectName;
    }
}
