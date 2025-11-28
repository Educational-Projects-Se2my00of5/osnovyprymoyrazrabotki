package com.example.project.repository;

import com.example.project.entity.Result;
import com.example.project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {

	@Query("select count(r) from Result r join r.assignedMembers m where m.user = :user")
	long countAssignedForUser(@Param("user") User user);

	@Query("select count(r) from Result r join r.assignedMembers m where m.user = :user and r.status = com.example.project.entity.enums.ResultStatus.COMPLETED")
	long countCompletedAssignedForUser(@Param("user") User user);

	@Query("select count(r) from Result r join r.assignedMembers m where m.user = :user and r.status = com.example.project.entity.enums.ResultStatus.OVERDUE")
	long countOverdueAssignedForUser(@Param("user") User user);
}
