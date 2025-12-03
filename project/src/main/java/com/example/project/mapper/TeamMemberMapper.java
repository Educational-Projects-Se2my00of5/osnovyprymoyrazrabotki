package com.example.project.mapper;

import com.example.project.dto.TeamMemberDto;
import com.example.project.entity.TeamMember;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TeamMemberMapper {

    @Mapping(target = "memberId", source = "id")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "firstName", source = "user.firstName")
    @Mapping(target = "lastName", source = "user.lastName")
    TeamMemberDto.MemberInfo toMemberInfo(TeamMember member);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "firstName", source = "user.firstName")
    @Mapping(target = "lastName", source = "user.lastName")
    TeamMemberDto.MemberSummary toMemberSummary(TeamMember member);
}
