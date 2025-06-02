package dev.lms.dto;

import dev.lms.models.StudyingProgress;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class CourseWithProgressDto {
    private Integer courseId;
    private Integer studyingProgressId;
    private String name;
    private String studyDirection;
    private LocalDateTime courseStartDate;
    private LocalDateTime graduationDate;
    private Integer hoursCount;
    private String courseStatus;
    private Integer percent;
    private String statusName;
    private Integer requestId;

    public CourseWithProgressDto(StudyingProgress progress) {
        this.studyingProgressId = progress.getId();
        this.courseId = progress.getRequest().getCourse().getId();
        this.name = progress.getRequest().getCourse().getName();
        this.studyDirection = progress.getRequest().getCourse().getStudyDirection();
        this.courseStartDate = progress.getRequest().getCourse().getStartDate();
        this.hoursCount = progress.getRequest().getCourse().getHoursCount();
        this.courseStatus = progress.getRequest().getCourse().getStatus().getName();
        this.percent = progress.getPercent();
        this.statusName = progress.getStatus().getName();
        this.graduationDate = progress.getGraduationDate();
    }
}
