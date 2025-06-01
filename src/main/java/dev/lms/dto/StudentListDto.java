package dev.lms.dto;

import dev.lms.models.Student;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentListDto {
    private Integer id;
    private String lastName;
    private String firstName;
    private String middleName;
    private String email;

    public StudentListDto(Student student) {
        this.id = student.getId();
        this.email = student.getEmail();
        this.middleName = student.getMiddleName();
        this.firstName = student.getFirstName();
        this.lastName = student.getLastName();
    }
}
