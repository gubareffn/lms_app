package dev.lms.service;

import dev.lms.dto.StudentListDto;
import dev.lms.dto.StudentRegistrationDto;
import dev.lms.models.Group;
import dev.lms.models.Student;
import dev.lms.repository.StudentRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentService {
    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public List<StudentListDto> getAllStudents() {
        return studentRepository.findAllWithRelations().stream()
                .map(StudentListDto::new)
                .collect(Collectors.toList());
    }

    public void saveStudent(Student student) {
        studentRepository.save(student);
    }

    public void deleteStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        studentRepository.deleteById(studentId);
    }
}
