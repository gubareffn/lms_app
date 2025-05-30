package dev.lms.dto;

import dev.lms.models.Student;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentRegistrationDto {
    private String surname;
    private String name;
    private String secondName;
    private String email;
    private String password;
    private Integer percent;


    public StudentRegistrationDto(Student student) {
        this.password = student.getPassword();
        this.email = student.getEmail();
        this.secondName = student.getMiddleName();
        this.name = student.getFirstName();
        this.surname = student.getLastName();
    }
}
