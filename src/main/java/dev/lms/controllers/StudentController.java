package dev.lms.controllers;

import dev.lms.models.Student;
import dev.lms.repository.StudentRepository;
import dev.lms.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {
    private final StudentService studentService;
    private final StudentRepository studentRepository;

    public StudentController(StudentService studentService, StudentRepository studentRepository) {
        this.studentService = studentService;
        this.studentRepository = studentRepository;
    }

    @GetMapping("/profile")
    public ResponseEntity<StudentProfileDto> getProfile(Authentication authentication) {
        String email = authentication.getName();

        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Student not found"));

        return ResponseEntity.ok(new StudentProfileDto(
                student.getFirstName(),
                student.getLastName(),
                student.getMiddleName(),
                student.getEmail()
        ));
    }

    record StudentProfileDto(
            String firstName,
            String lastName,
            String middleName,
            String email
    ) {}

    // Получение всех студентов
    @GetMapping
    public List<Student> getStudents() {
        return studentService.getAllStudents();
    }

    // Добавление студента
    @PostMapping
    public Student addStudent(@RequestBody Student student) {
        return studentService.createStudent(student);
    }

    // Заглушка для обновления студента
    @PutMapping
    public Student updateStudent(@RequestBody Student student) {
        return null;
    }
}
