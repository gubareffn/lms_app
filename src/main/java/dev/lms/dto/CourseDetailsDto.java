package dev.lms.dto;

import lombok.Getter;
import lombok.Setter;
import dev.lms.models.Course;

import java.time.LocalDateTime;
import java.util.Optional;

// CourseDetailsDto.java
@Getter
@Setter
public class CourseDetailsDto {
    private Integer id;
    private String name;
    private String description;
    private String studyDirection;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer hoursCount;
    private String resultCompetence;
    private String category;
    private String status;


    public CourseDetailsDto(Course course) {
        this.id = course.getId();
        this.name = course.getName();
        this.description = course.getDescription();
        this.studyDirection = course.getStudyDirection();
        this.startDate = course.getStartDate();
        this.endDate = course.getEndDate();
        this.hoursCount = course.getHoursCount();
        this.resultCompetence = course.getResultCompetence();
        this.category = course.getCategory().getName();
        this.status = course.getStatus().getName();
//        this.assignments = course.getAssignments().stream()
//                .map(AssignmentDto::new)
//                .collect(Collectors.toList());
    }
}

