package com.example.project.repository;

import com.example.project.entity.Project;
import com.example.project.entity.Result;
import com.example.project.entity.TeamMember;
import com.example.project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {

	@Query("select count(r) from Result r join r.assignedMembers m where m.user = :user")
	long countAssignedForUser(@Param("user") User user);

	@Query("select count(r) from Result r join r.assignedMembers m where m.user = :user and r.status = com.example.project.entity.enums.ResultStatus.COMPLETED")
	long countCompletedAssignedForUser(@Param("user") User user);

	@Query("select count(r) from Result r join r.assignedMembers m where m.user = :user and r.status = com.example.project.entity.enums.ResultStatus.OVERDUE")
	long countOverdueAssignedForUser(@Param("user") User user);

	@Query("select count(r) from Result r where r.project = :project")
	long countByProject(@Param("project") Project project);

	@Query("select count(r) from Result r join r.assignedMembers m where m.project = :project and m.user = :user")
	long countAssignedForUserInProject(@Param("project") Project project, @Param("user") User user);

	@Query("select count(r) from Result r where r.project = :project and r.status = com.example.project.entity.enums.ResultStatus.COMPLETED")
	long countCompletedByProject(@Param("project") Project project);

	@Query("select count(r) from Result r where r.project = :project and r.status = com.example.project.entity.enums.ResultStatus.OVERDUE")
	long countOverdueByProject(@Param("project") Project project);

	@Query("select count(r) from Result r join r.assignedMembers m where m.project = :project and m.user = :user and r.status = com.example.project.entity.enums.ResultStatus.COMPLETED")
	long countCompletedAssignedForUserInProject(@Param("project") Project project, @Param("user") User user);

	@Query("select count(r) from Result r join r.assignedMembers m where m.project = :project and m.user = :user and r.status = com.example.project.entity.enums.ResultStatus.OVERDUE")
	long countOverdueAssignedForUserInProject(@Param("project") Project project, @Param("user") User user);

	List<Result> findByProject(Project project);

	@Query("select distinct r from Result r join r.assignedMembers m where r.project = :project and m.user = :user")
	List<Result> findByProjectAndAssignedUser(@Param("project") Project project, @Param("user") User user);

	@Query("select distinct r from Result r join r.assignedMembers m where m = :member")
	List<Result> findByAssignedMember(@Param("member") TeamMember member);

	@Query("select distinct r from Result r join r.assignedMembers m where m.user = :user")
	List<Result> findByAssignedUser(@Param("user") User user);
}
