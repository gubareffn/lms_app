package dev.lms.service;

import dev.lms.jwt.AuthRequest;
import dev.lms.jwt.AuthResponse;
import dev.lms.jwt.JwtCore;
import dev.lms.dto.StudentRegistrationDto;
import dev.lms.models.Student;
import dev.lms.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtCore jwtTokenUtil;

    public AuthResponse registerStudent(StudentRegistrationDto dto) {
        if (studentRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Student student = new Student();
        student.setLastName(dto.getSurname());
        student.setFirstName(dto.getName());
        student.setMiddleName(dto.getSecondName());
        student.setEmail(dto.getEmail());
        student.setPassword(passwordEncoder.encode(dto.getPassword()));

        Student savedStudent = studentRepository.save(student);
        String token = jwtTokenUtil.generateToken(savedStudent.getEmail(), savedStudent.getId());

        return new AuthResponse(token, savedStudent.getId(), savedStudent.getEmail());
    }

    public AuthResponse authenticateStudent(AuthRequest request) {
        Student student = studentRepository.findByEmail(request.email())
                .orElseThrow(() -> new UsernameNotFoundException("Student not found"));

        if (!passwordEncoder.matches(request.password(), student.getPassword())) {
            throw new BadCredentialsException("Invalid password");
        }

        String token = jwtTokenUtil.generateToken(student.getEmail(), student.getId());
        return new AuthResponse(token, student.getId(), student.getEmail());
    }
}