package dev.lms.dto;

import lombok.Data;

@Data
public class StudyingProgressDto {
    private Integer courseId;
    private Integer currentStep;
    private Integer totalSteps;
    private Integer percent;
}
