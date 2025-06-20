package dev.lms.dto;

import dev.lms.models.Student;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class StudentRegistrationDto {
    private String lastName;
    private String firstName;
    private String middleName;
    private String email;
    private String password;


    public StudentRegistrationDto(Student student) {
        this.password = student.getPassword();
        this.email = student.getEmail();
        this.middleName = student.getMiddleName();
        this.firstName = student.getFirstName();
        this.lastName = student.getLastName();
    }
}
