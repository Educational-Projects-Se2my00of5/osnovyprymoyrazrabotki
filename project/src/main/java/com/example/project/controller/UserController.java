package com.example.project.controller;

import com.example.project.dto.UserDto;
import com.example.project.service.UserService;
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

    private final UserService userService;

    @GetMapping("/me")
    @ResponseStatus(HttpStatus.OK)
    public UserDto.UserInfo getUserInfo(@RequestHeader("Authorization") String authHeader) {
        return userService.getUserInfo(authHeader);
    }
}
