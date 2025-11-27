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
        private String firstName;

        @NotBlank(message = "Фамилия обязательна")
        private String lastName;

        @NotBlank(message = "Email обязателен")
        @Email(message = "Email должен быть корректным")
        private String email;

        @NotBlank(message = "Пароль обязателен")
        @Size(min = 6, message = "Пароль должен быть минимум 6 символов")
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
