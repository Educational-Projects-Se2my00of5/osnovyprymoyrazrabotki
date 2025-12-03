package com.example.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class DependencyDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DependencyInfo {
        private Long id;
        private Long taskId;
        private String taskTitle;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParentTaskInfo {
        private Long taskId;
        private String taskTitle;
    }
}
