package com.example.project.repository;

import com.example.project.entity.Dependency;
import com.example.project.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DependencyRepository extends JpaRepository<Dependency, Long> {
    // Находит зависимость, где task является дочерней (requiredTask)
    // Возвращает Optional, так как у задачи может быть только один родитель (UNIQUE constraint)
    Optional<Dependency> findByRequiredTask(Task requiredTask);

    // Находит все зависимости, где task является родительской (dependentTask)
    // Возвращает List, так как у задачи может быть много детей
    List<Dependency> findByDependentTask(Task dependentTask);
}
