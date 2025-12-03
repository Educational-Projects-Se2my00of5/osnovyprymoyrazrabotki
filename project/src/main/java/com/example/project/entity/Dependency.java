package com.example.project.entity;

import com.example.project.entity.enums.DependencyType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "dependencies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dependency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dependent_task_id", nullable = false)
    private Task dependentTask;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "required_task_id", nullable = false)
    private Task requiredTask;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DependencyType dependencyType;
}
