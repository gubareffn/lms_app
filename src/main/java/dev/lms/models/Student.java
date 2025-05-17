package dev.lms.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name="student")
@Getter
@Setter
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id")
    private Integer id;

    @Column(name = "surname", nullable = false, length = 50)
    private String lastName;

    @Column(name = "name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "second_name", nullable = false, length = 50)
    private String middleName;

    @Column(name = "password", nullable = false, length = 64)
    private String password;

    @Column(name = "email", nullable = false, length = 50, unique = true)
    private String email;

//    @OneToOne(mappedBy = "student", cascade = CascadeType.ALL)
//    private Passport passport;
//
//    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
//    private Set<Document> documents = new HashSet<>();
//
//    @OneToMany(mappedBy = "student")
//    private Set<Request> requests = new HashSet<>();
//
//    @OneToMany(mappedBy = "student")
//    private Set<Solution> solutions = new HashSet<>();
}
