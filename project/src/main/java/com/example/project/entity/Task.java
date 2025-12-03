package com.example.project.entity;

import com.example.project.entity.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime deadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status;

    @Column(nullable = false)
    private Integer priority;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToMany
    @JoinTable(
            name = "task_assignees",
            joinColumns = @JoinColumn(name = "task_id"),
            inverseJoinColumns = @JoinColumn(name = "team_member_id")
    )
    @Builder.Default
    private List<TeamMember> assignedMembers = new ArrayList<>();

    @OneToMany(mappedBy = "dependentTask", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Dependency> dependencies = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = TaskStatus.NOT_STARTED;
        }
        if (priority == null) {
            priority = 0;
        }
    }
}
