package dev.lms.dto;

import dev.lms.models.Assignment;
import dev.lms.models.Solution;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class SolutionsDto {
    private int id;
    private LocalDateTime sendingDate;
    private String solutionComment;
    private Integer solutionScore;
    private Integer workerId;
    private Integer assignmentId;
    private Integer studentId;
    private String studentName;
    private String studentMiddleName;
    private String studentLastName;
    private Integer statusId;

    public SolutionsDto(Solution solution) {
        this.id = solution.getId();
        this.sendingDate = solution.getSendingDate();
        this.solutionComment = solution.getSolutionComment();
        this.solutionScore = solution.getSolutionScore();
        if(workerId != null)
            this.workerId = solution.getWorker().getId();
        this.assignmentId = solution.getAssignment().getId();
        this.studentId = solution.getStudent().getId();
        this.studentName = solution.getStudent().getFirstName();
        this.studentMiddleName = solution.getStudent().getMiddleName();
        this.studentLastName = solution.getStudent().getLastName();
        this.statusId =  solution.getStatus().getId();
    }

    public SolutionsDto(SolutionsDto solutionsDto) {
    }
}
