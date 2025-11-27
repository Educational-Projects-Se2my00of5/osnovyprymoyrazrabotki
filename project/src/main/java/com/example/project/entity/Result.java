package com.example.project.entity;

import com.example.project.entity.enums.ResultStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "results")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Result {

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
    private ResultStatus status;

    @Column(nullable = false)
    private Integer priority;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToMany
    @JoinTable(
            name = "result_assignees",
            joinColumns = @JoinColumn(name = "result_id"),
            inverseJoinColumns = @JoinColumn(name = "team_member_id")
    )
    private List<TeamMember> assignedMembers = new ArrayList<>();

    @OneToMany(mappedBy = "dependentResult", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Dependency> dependencies = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = ResultStatus.NOT_STARTED;
        }
        if (priority == null) {
            priority = 0;
        }
    }
}
