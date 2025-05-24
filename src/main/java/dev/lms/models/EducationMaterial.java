package dev.lms.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "educational_material")
@Getter
@Setter
public class EducationMaterial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "material_id")
    private Integer id;

    @Column(name = "studying_material_name", nullable = false)
    private String name;

    @Column(name = "added_date", nullable = false)
    private LocalDateTime adding_date;

    @Column(name = "material_text")
    private String text;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
}
