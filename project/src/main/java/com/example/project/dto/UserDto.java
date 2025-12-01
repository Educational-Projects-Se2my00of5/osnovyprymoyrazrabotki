package com.example.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


public class UserDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private String id;
        private String firstName;
        private String lastName;
        private String email;
        private LocalDateTime registrationDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        @NotBlank(message = "Имя обязательно")
        @Size(min = 1, max = 50, message = "Имя должно быть от 1 до 50 символов")
        private String firstName;

        @NotBlank(message = "Фамилия обязательна")
        @Size(min = 1, max = 50, message = "Фамилия должна быть от 1 до 50 символов")
        private String lastName;
    }
}
