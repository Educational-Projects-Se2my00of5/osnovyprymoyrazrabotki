package com.example.project.repository;

import com.example.project.entity.Dependency;
import com.example.project.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DependencyRepository extends JpaRepository<Dependency, Long> {
    List<Dependency> findByRequiredTask(Task requiredTask);
    Optional<Dependency> findByDependentTask(Task dependentTask);
}
