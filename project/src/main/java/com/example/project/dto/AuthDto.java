package com.example.project.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank(message = "Имя обязательно")
        @Size(min = 1, max = 50, message = "Имя должно быть от 1 до 50 символов")
        private String firstName;

        @NotBlank(message = "Фамилия обязательна")
        @Size(min = 1, max = 50, message = "Фамилия должна быть от 1 до 50 символов")
        private String lastName;

        @NotBlank(message = "Email обязателен")
        @Email(message = "Email должен быть корректным")
        private String email;

        @NotBlank(message = "Пароль обязателен")
        @Size(min = 6, max = 100, message = "Пароль должен быть от 6 до 100 символов")
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "Email обязателен")
        @Email(message = "Email должен быть корректным")
        private String email;

        @NotBlank(message = "Пароль обязателен")
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RefreshTokenRequest {
        @NotBlank(message = "Refresh token обязателен")
        private String refreshToken;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BothTokensResponse {
        private String accessToken;
        private String refreshToken;
    }


}
