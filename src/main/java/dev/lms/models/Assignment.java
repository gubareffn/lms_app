package dev.lms.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "assignment")
public class Assignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_id")
    private Integer id;

    @Column(name = "assignment_name", nullable = false, length = 100)
    private String assignmentName;

    @Column(name = "assignment_description", nullable = false, length = Integer.MAX_VALUE)
    private String assignmentDescription;

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @Column(name = "is_essential")
    private Boolean isEssential = false;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.RESTRICT)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
}