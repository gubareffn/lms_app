package dev.lms.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


@Entity
@Table(name="studying_status")
@Getter
@Setter
public class StudyingStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "studying_status_id")
    private Integer id;

    @Column(name = "name", nullable = false, length = 30)
    private String name;

}
