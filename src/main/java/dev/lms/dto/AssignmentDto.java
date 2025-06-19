package dev.lms.dto;

import dev.lms.models.Assignment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class AssignmentDto {
    private Integer id;
    private String assignmentName;
    private String assignmentDescription;
    private LocalDateTime deadline;
    private boolean isEsential;
    private Integer courseId;

    public AssignmentDto(Assignment assignment) {
        this.id = assignment.getId();
        this.assignmentName = assignment.getAssignmentName();
        this.assignmentDescription = assignment.getAssignmentDescription();
        this.deadline = assignment.getDeadline();
        this.isEsential = assignment.getIsEssential();
        this.courseId = assignment.getCourse().getId();
    }
}
