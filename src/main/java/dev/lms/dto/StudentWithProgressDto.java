package dev.lms.dto;

import dev.lms.models.Request;
import dev.lms.models.Student;
import dev.lms.models.StudyingProgress;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentWithProgressDto {
    private String surname;
    private String name;
    private String secondName;
    private String email;
    private String password;
    private Integer percent;
    private String statusName;
    private Integer requestId;


    public StudentWithProgressDto(StudyingProgress progress) {
        this.password = progress.getRequest().getStudent().getPassword();
        this.email = progress.getRequest().getStudent().getEmail();
        this.secondName = progress.getRequest().getStudent().getMiddleName();
        this.name = progress.getRequest().getStudent().getFirstName();
        this.surname = progress.getRequest().getStudent().getLastName();
        this.percent = progress.getPercent();
        this.statusName = progress.getStatus().getName();
        this.requestId = progress.getRequest().getId();
    }
}
