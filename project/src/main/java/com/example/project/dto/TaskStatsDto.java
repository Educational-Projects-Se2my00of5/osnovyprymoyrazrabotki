package com.example.project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class TaskStatsDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignedStats {
        private long total;
        private long closed;
        private long overdue;
    }
}
