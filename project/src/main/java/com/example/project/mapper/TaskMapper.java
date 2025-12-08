package com.example.project.mapper;

import com.example.project.dto.DependencyDto;
import com.example.project.dto.TaskDto;
import com.example.project.entity.Task;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {TeamMemberMapper.class, DependencyMapper.class})
public interface TaskMapper {

    @Mapping(target = "status", expression = "java(task.getStatus())")
    @Mapping(target = "assignees", source = "task.assignedMembers")
    @Mapping(target = "parentTask", source = "parentTask")
    TaskDto.TaskSummary toTaskSummary(Task task, DependencyDto.ParentTaskInfo parentTask);

    @Mapping(target = "status", expression = "java(task.getStatus())")
    @Mapping(target = "projectId", source = "task.project.id")
    @Mapping(target = "projectName", source = "task.project.name")
    @Mapping(target = "assignees", source = "task.assignedMembers")
    @Mapping(target = "dependencies", source = "dependencies")
    @Mapping(target = "parentTask", source = "parentTask")
    TaskDto.TaskDetails toTaskDetails(Task task, List<DependencyDto.DependencyInfo> dependencies, DependencyDto.ParentTaskInfo parentTask);

    @Mapping(target = "status", expression = "java(task.getStatus())")
    @Mapping(target = "projectId", source = "task.project.id")
    @Mapping(target = "projectName", source = "task.project.name")
    @Mapping(target = "assignees", source = "task.assignedMembers")
    @Mapping(target = "parentTask", source = "parentTask")
    TaskDto.CreateResponse toCreateResponse(Task task, DependencyDto.ParentTaskInfo parentTask);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "title", source = "title")
    TaskDto.TaskOption toTaskOption(Task task);
}
