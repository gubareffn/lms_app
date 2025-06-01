package dev.lms.dto;

import dev.lms.models.StudyingProgress;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class StudyingProgressDto {
    private Integer studyingProgressId;
    private Integer courseId;
    private Integer percent;
    private LocalDateTime startDate;
    private LocalDateTime graduationDate;
    private String status;

    public StudyingProgressDto(StudyingProgress progress) {
        this.studyingProgressId = progress.getId();
        this.courseId = progress.getRequest().getCourse().getId();
        this.percent = progress.getPercent();
        this.status = progress.getStatus().getName();
        this.startDate = progress.getEducationStartDate();
        this.graduationDate = progress.getGraduationDate();
    }
}
