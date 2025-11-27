package com.example.project.service;

import com.example.project.dto.AuthDto;
import com.example.project.entity.RefreshToken;
import com.example.project.entity.User;
import com.example.project.exception.AuthenticationException;
import com.example.project.exception.BadRequestException;
import com.example.project.exception.NotFoundException;
import com.example.project.mapper.UserMapper;
import com.example.project.repository.RefreshTokenRepository;
import com.example.project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public void register(AuthDto.RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email уже используется");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();
        userRepository.save(user);
    }

    @Transactional
    public AuthDto.BothTokensResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthenticationException("Неверный email или пароль"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthenticationException("Неверный email или пароль");
        }

        // Отзываем старые refresh токены
        refreshTokenRepository.deleteByUser(user);

        String accessToken = jwtService.generateAccessToken(user);
        RefreshToken refreshToken = new RefreshToken(jwtService.generateRefreshToken(user), user);

        return AuthDto.BothTokensResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .build();
    }

    @Transactional
    public AuthDto.BothTokensResponse refreshToken(AuthDto.RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenService.findRefreshToken(request.getRefreshToken());
        refreshTokenService.verifyRefreshToken(refreshToken);

        User user = userRepository.findByEmail(jwtService.extractEmailFromToken(refreshToken.getToken()))
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
        String accessToken = jwtService.generateAccessToken(user);

        return AuthDto.BothTokensResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .build();
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenService.revokeRefreshToken(refreshToken);
    }
}
