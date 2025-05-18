package dev.lms.dto;

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

    public StudentRegistrationDto(String password, String email, String secondName, String name, String surname) {
        this.password = password;
        this.email = email;
        this.secondName = secondName;
        this.name = name;
        this.surname = surname;
    }
}
