package com.example.project.service;


import com.example.project.dto.UserDto;
import com.example.project.entity.User;
import com.example.project.exception.NotFoundException;
import com.example.project.mapper.UserMapper;
import com.example.project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    public UserDto.UserInfo getUserInfo(String authHeader) {
        User user = userRepository.findByEmail(jwtService.extractEmailFromHeader(authHeader))
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));

        return userMapper.userToUserInfo(user);
    }

    public UserDto.UserInfo updateUserInfo(String authHeader, UserDto.UpdateRequest request) {
        User user = userRepository.findByEmail(jwtService.extractEmailFromHeader(authHeader))
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));

        if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null && !request.getLastName().isBlank()) {
            user.setLastName(request.getLastName());
        }

        User saved = userRepository.save(user);
        return userMapper.userToUserInfo(saved);
    }
}
