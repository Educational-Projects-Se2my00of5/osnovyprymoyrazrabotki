package com.example.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

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
        private String role;
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
        @NotBlank(message = "Название проекта обязательно")
        @Size(min = 3, max = 255, message = "Название от 3 до 255 символов")
        private String name;

        @NotBlank(message = "Описание проекта обязательно")
        @Size(max = 1500, message = "Описание не более 1500 символов")
        private String description;

        @NotBlank(message = "Предмет обязателен")
        @Size(min = 2, max = 255, message = "Предмет от 2 до 255 символов")
        private String subjectName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        @NotBlank(message = "Название проекта обязательно")
        @Size(min = 3, max = 255, message = "Название от 3 до 255 символов")
        private String name;

        @NotBlank(message = "Описание проекта обязательно")
        @Size(max = 2000, message = "Описание не более 2000 символов")
        private String description;

        @NotBlank(message = "Предмет обязателен")
        @Size(min = 2, max = 255, message = "Предмет от 2 до 255 символов")
        private String subjectName;

        @NotBlank(message = "Статус обязателен")
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskTypeStats {
        private long total;
        private long closed;
        private long overdue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskStats {
        private TaskTypeStats assigned; // назначенные мне
        private TaskTypeStats all;      // все в проекте
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddMemberRequest {
        @NotNull(message = "ID пользователя обязателен")
        private Long userId;

        @Size(max = 100, message = "Роль не более 100 символов")
        private String role;
    }
}
