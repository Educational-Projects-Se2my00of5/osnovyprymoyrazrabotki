package com.example.project.mapper;

import com.example.project.dto.DependencyDto;
import com.example.project.entity.Dependency;
import com.example.project.entity.Task;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DependencyMapper {

    @Mapping(target = "taskId", source = "dependentTask.id")
    @Mapping(target = "taskTitle", source = "dependentTask.title")
    DependencyDto.DependencyInfo toDependencyInfo(Dependency dependency);

    @Mapping(target = "taskId", source = "id")
    @Mapping(target = "taskTitle", source = "title")
    DependencyDto.DependencyInfo toDependencyInfoFromTask(Task task);

    @Mapping(target = "taskId", source = "id")
    @Mapping(target = "taskTitle", source = "title")
    DependencyDto.ParentTaskInfo toParentTaskInfo(Task task);
}
