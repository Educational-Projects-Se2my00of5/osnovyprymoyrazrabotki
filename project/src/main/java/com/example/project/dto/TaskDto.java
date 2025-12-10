package com.example.project.dto;

import com.example.project.entity.enums.ProjectStatus;
import com.example.project.entity.enums.TaskPriority;
import com.example.project.entity.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class TaskDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskSummary {
        private Long id;
        private String title;
        private String description;
        private LocalDateTime deadline;
        private TaskStatus status;
        private TaskPriority priority;
        private List<TeamMemberDto.MemberInfo> assignees;
        private DependencyDto.ParentTaskInfo parentTask;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskDetails {
        private Long id;
        private String title;
        private String description;
        private LocalDateTime deadline;
        private TaskStatus status;
        private TaskPriority priority;
        private Long projectId;
        private String projectName;
        private ProjectStatus projectStatus;
        private List<TeamMemberDto.MemberInfo> assignees;
        private List<DependencyDto.DependencyInfo> dependencies;
        private DependencyDto.ParentTaskInfo parentTask;
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
        private TaskPriority priority;

        private List<Long> assigneeIds; // ID участников проекта для назначения

        private Long parentTaskId; // ID родительской задачи
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateResponse {
        private Long id;
        private String title;
        private String description;
        private LocalDateTime deadline;
        private TaskStatus status;
        private TaskPriority priority;
        private Long projectId;
        private String projectName;
        private ProjectStatus projectStatus;
        private List<TeamMemberDto.MemberInfo> assignees;
        private DependencyDto.ParentTaskInfo parentTask;
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
        private TaskPriority priority;

        @NotNull(message = "Статус обязателен")
        private TaskStatus status;

        @NotEmpty(message = "Необходимо назначить хотя бы одного исполнителя")
        private List<Long> assigneeIds;

        private Long parentTaskId; // null = удалить родителя, отсутствует = не менять
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignMemberRequest {
        @NotNull(message = "ID участника обязателен")
        private Long memberId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignedStats {
        private Long total;
        private Long closed;
        private Long overdue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskOption {
        private Long id;
        private String title;
    }
}
