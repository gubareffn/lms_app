package dev.lms.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "course_status")
@Getter
@Setter
public class CourseStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "course_status_id")
    private Integer id;

    @Column(name = "course_status_name", nullable = false, length = 30)
    private String name;

}