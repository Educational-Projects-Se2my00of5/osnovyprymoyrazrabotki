package com.example.project.controller;

import com.example.project.dto.UserDto;
import com.example.project.exception.NotFoundException;
import com.example.project.mapper.UserMapper;
import com.example.project.repository.UserRepository;
import com.example.project.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @GetMapping("/me")
    @ResponseStatus(HttpStatus.OK)
    public UserDto.UserInfo getUserInfo(@RequestHeader("Authorization") String authHeader) {
        Long userId = jwtService.extractUserIdFromHeader(authHeader);
        return userMapper.userToUserInfo(
                userRepository.findById(userId)
                        .orElseThrow(() -> new NotFoundException("Пользователь не найден"))
        );
    }
}
