package com.example.project.repository;

import com.example.project.entity.Project;
import com.example.project.entity.Task;
import com.example.project.entity.TeamMember;
import com.example.project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    @Query("select count(t) from Task t join t.assignedMembers m where m.user = :user")
    long countAssignedForUser(@Param("user") User user);

    @Query("select count(t) from Task t join t.assignedMembers m where m.user = :user and t.status = com.example.project.entity.enums.TaskStatus.COMPLETED")
    long countCompletedAssignedForUser(@Param("user") User user);

    @Query("select count(t) from Task t where t.project = :project")
    long countByProject(@Param("project") Project project);

    @Query("select count(t) from Task t join t.assignedMembers m where m.project = :project and m.user = :user")
    long countAssignedForUserInProject(@Param("project") Project project, @Param("user") User user);

    @Query("select count(t) from Task t where t.project = :project and t.status = com.example.project.entity.enums.TaskStatus.COMPLETED")
    long countCompletedByProject(@Param("project") Project project);

    @Query("select count(t) from Task t join t.assignedMembers m where m.project = :project and m.user = :user and t.status = com.example.project.entity.enums.TaskStatus.COMPLETED")
    long countCompletedAssignedForUserInProject(@Param("project") Project project, @Param("user") User user);

    // Просроченные задачи - по дедлайну, не по статусу
    @Query("select count(t) from Task t join t.assignedMembers m where m.user = :user and t.status != com.example.project.entity.enums.TaskStatus.COMPLETED and t.deadline < CURRENT_TIMESTAMP")
    long countOverdueAssignedForUser(@Param("user") User user);

    @Query("select count(t) from Task t where t.project = :project and t.status != com.example.project.entity.enums.TaskStatus.COMPLETED and t.deadline < CURRENT_TIMESTAMP")
    long countOverdueByProject(@Param("project") Project project);

    @Query("select count(t) from Task t join t.assignedMembers m where m.project = :project and m.user = :user and t.status != com.example.project.entity.enums.TaskStatus.COMPLETED and t.deadline < CURRENT_TIMESTAMP")
    long countOverdueAssignedForUserInProject(@Param("project") Project project, @Param("user") User user);

    List<Task> findByProject(Project project);

    @Query("select distinct t from Task t join t.assignedMembers m where t.project = :project and m.user = :user")
    List<Task> findByProjectAndAssignedUser(@Param("project") Project project, @Param("user") User user);

    @Query("select distinct t from Task t join t.assignedMembers m where m = :member")
    List<Task> findByAssignedMember(@Param("member") TeamMember member);

    @Query("select distinct t from Task t join t.assignedMembers m where m.user = :user")
    List<Task> findByAssignedUser(@Param("user") User user);

    @Query("select t from Task t where t.project = :project and size(t.dependencies) = 0")
    List<Task> findRootTasksByProject(@Param("project") Project project);
}
