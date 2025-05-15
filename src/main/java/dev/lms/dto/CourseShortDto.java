package dev.lms.dto;

import lombok.Getter;
import lombok.Setter;
import dev.lms.models.Course;

import java.time.LocalDateTime;

// CourseShortDto.java
@Getter
@Setter
public class CourseShortDto {
    private Integer id;
    private String name;
    private String studyDirection;
    private LocalDateTime startDate;
    private Integer hoursCount;
    private String status;

    public CourseShortDto(Course course) {
        this.id = course.getId();
        this.name = course.getName();
        this.studyDirection = course.getStudyDirection();
        this.startDate = course.getStartDate();
        this.hoursCount = course.getHoursCount();
        this.status = course.getStatus().getName();
    }
}