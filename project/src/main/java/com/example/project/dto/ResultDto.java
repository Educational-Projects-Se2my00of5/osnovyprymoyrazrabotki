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

public class ResultDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResultSummary {
        private Long id;
        private String title;
        private String description;
        private LocalDateTime deadline;
        private String status;
        private Integer priority;
        private List<AssigneeInfo> assignees;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssigneeInfo {
        private Long memberId;
        private Long userId;
        private String firstName;
        private String lastName;
        private String role;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResultDetails {
        private Long id;
        private String title;
        private String description;
        private LocalDateTime deadline;
        private String status;
        private Integer priority;
        private Long projectId;
        private String projectName;
        private List<AssigneeInfo> assignees;
        private List<DependencyInfo> dependencies;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DependencyInfo {
        private Long id;
        private Long requiredResultId;
        private String requiredResultTitle;
        private String dependencyType;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Название обязательно")
        @Size(min = 3, max = 255, message = "Название должно быть от 3 до 255 символов")
        private String title;

        @Size(max = 2000, message = "Описание не должно превышать 2000 символов")
        private String description;

        @NotNull(message = "Дедлайн обязателен")
        private LocalDateTime deadline;

        @NotNull(message = "Приоритет обязателен")
        private Integer priority;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        @NotBlank(message = "Название обязательно")
        @Size(min = 3, max = 255, message = "Название должно быть от 3 до 255 символов")
        private String title;

        @Size(max = 2000, message = "Описание не должно превышать 2000 символов")
        private String description;

        @NotNull(message = "Дедлайн обязателен")
        private LocalDateTime deadline;

        @NotNull(message = "Приоритет обязателен")
        private Integer priority;

        @NotBlank(message = "Статус обязателен")
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignMemberRequest {
        @NotNull(message = "ID участника обязателен")
        private Long memberId;
    }
}
