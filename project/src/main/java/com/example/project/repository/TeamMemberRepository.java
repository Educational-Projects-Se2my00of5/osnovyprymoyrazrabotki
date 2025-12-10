package com.example.project.repository;

import com.example.project.entity.Project;
import com.example.project.entity.TeamMember;
import com.example.project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    List<TeamMember> findByUser(User user);

    Optional<TeamMember> findByUserAndProject(User user, Project project);

    List<TeamMember> findAllByProject(Project project);
}
