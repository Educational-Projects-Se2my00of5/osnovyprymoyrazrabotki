package com.example.project.mapper;

import com.example.project.dto.UserDto;
import com.example.project.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto.UserInfo userToUserInfo(User user);
}
