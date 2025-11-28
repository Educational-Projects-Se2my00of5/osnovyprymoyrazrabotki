package com.example.project.service;

import com.example.project.entity.RefreshToken;
import com.example.project.exception.AuthenticationException;
import com.example.project.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Проверка и валидация refresh токена
     */
    public RefreshToken verifyRefreshToken(RefreshToken token) {
        if (!jwtService.isTokenValid(token.getToken())) {
            refreshTokenRepository.delete(token);
            throw new AuthenticationException("Refresh token истек или отозван");
        }
        return token;
    }

    /**
     * Поиск refresh токена по строке
     */
    public RefreshToken findRefreshToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new AuthenticationException("Refresh token не найден"));
    }

    /**
     * Отзыв (инвалидация) refresh токена
     */
    @Transactional
    public void revokeRefreshToken(String token) {
        refreshTokenRepository.deleteByToken(token);
    }
}
