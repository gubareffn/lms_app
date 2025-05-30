package dev.lms.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "studying_progress")
@Getter
@Setter
public class StudyingProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "progress_id")
    private Integer id;

    @Column(name = "education_start_date", nullable = false)
    private LocalDateTime educationStartDate;

    @Column(name = "graduation_date")
    private LocalDateTime graduationDate;

    @Column(name = "final_grade")
    private Integer finalGrade;

    @Column(name = "completion_percentage")
    private Integer percent;

    @Column(name = "final_exam_result")
    private Integer finaExamResult;

    @ManyToOne
    @JoinColumn(name = "request_id", nullable = false)
    private Request request;

    @ManyToOne
    @JoinColumn(name = "studying_status_id", nullable = false)
    private StudyingStatus status;
}
