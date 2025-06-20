package dev.lms.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;


@Getter
@Setter
@Entity
@Table(name = "course")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "course_id")
    private Integer id;

    @Column(name = "course_name", nullable = false, length = 100)
    private String name;

    @Column(name = "course_description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "study_direction", nullable = false, length = 50)
    private String studyDirection;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "hours_count", nullable = false)
    private Integer hoursCount;

    @Column(name = "result_competence", nullable = false, length = 200)
    private String resultCompetence;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_status_id", nullable = false)
    private CourseStatus status;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "course_worker",
            joinColumns = @JoinColumn(name = "course_id"),
            inverseJoinColumns = @JoinColumn(name = "worker_id")
    )
    private Set<Worker> worker = new HashSet<Worker>();
}
