package dev.lms.controllers;

import dev.lms.dto.StudentListDto;
import dev.lms.models.Request;
import dev.lms.models.Student;
import dev.lms.repository.StudentRepository;
import dev.lms.service.RequestService;
import dev.lms.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
public class StudentController {
    private final StudentService studentService;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentController(StudentService studentService, StudentRepository studentRepository, PasswordEncoder passwordEncoder) {
        this.studentService = studentService;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/profile/{studentId}")
    public ResponseEntity<StudentProfileDto> getStudentProfile(@PathVariable Integer studentId) {

        Student student = studentRepository.findById(Long.valueOf(studentId))
                .orElseThrow(() -> new UsernameNotFoundException("Student not found"));

        return ResponseEntity.ok(new StudentProfileDto(
                student.getFirstName(),
                student.getLastName(),
                student.getMiddleName(),
                student.getEmail()
        ));
    }

    @GetMapping("/profile")
    public ResponseEntity<StudentProfileDto> getMyProfile(Authentication authentication) {
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
    public List<StudentListDto> getStudents() {
        return studentService.getAllStudents();
    }

    // Добавление студента
//    @PostMapping
//    public Student addStudent(@RequestBody Student student) {
//        return studentService.createStudent(student);
//    }
//

    // Обновление студента
    @Transactional
    @PutMapping("/{studentId}/update")
    public ResponseEntity<?> updateStudent(@PathVariable Long studentId,
                                 @RequestBody Map<String, String> requestBody) {
        Student updateStudent = studentRepository.findById(studentId).orElse(null);
        if (updateStudent == null) {
            return ResponseEntity.status(404).body("Student not found");
        }

        updateStudent.setFirstName(requestBody.get("firstName"));
        updateStudent.setLastName(requestBody.get("lastName"));
        updateStudent.setMiddleName(requestBody.get("middleName"));
        updateStudent.setEmail(requestBody.get("email"));
        updateStudent.setPassword(passwordEncoder.encode(requestBody.get("password")));
        studentService.saveStudent(updateStudent);
        return ResponseEntity.ok(updateStudent);
    }

    @DeleteMapping("/{studentId}/delete")
    public ResponseEntity<?> deleteGroup(@PathVariable Long studentId){
        studentService.deleteStudent(studentId);
        return  ResponseEntity.ok("Student deleted");
    }
}
