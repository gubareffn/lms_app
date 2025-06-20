package dev.lms.service;

import dev.lms.jwt.AuthRequest;
import dev.lms.jwt.AuthResponse;
import dev.lms.jwt.JwtCore;
import dev.lms.dto.StudentRegistrationDto;
import dev.lms.models.Student;
import dev.lms.models.Worker;
import dev.lms.models.WorkerRole;
import dev.lms.repository.StudentRepository;
import dev.lms.repository.WorkerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final StudentRepository studentRepository;
    private final WorkerRepository workerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtCore jwtTokenUtil;


    public AuthResponse registerStudent(StudentRegistrationDto dto) {
        if (studentRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Student student = new Student();
        student.setLastName(dto.getLastName());
        student.setFirstName(dto.getFirstName());
        student.setMiddleName(dto.getMiddleName());
        student.setEmail(dto.getEmail());
        student.setPassword(passwordEncoder.encode(dto.getPassword()));

        Student savedStudent = studentRepository.save(student);
        String token = jwtTokenUtil.generateToken(savedStudent.getEmail(), savedStudent.getId(), "STUDENT", "Студент");

        return new AuthResponse(token, savedStudent.getId(), savedStudent.getEmail(), "STUDENT", "Студент");
    }

    public AuthResponse registerWorker(String email, String password, String firstName,
                                       String lastName, WorkerRole role) {
        if (workerRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        Worker worker = new Worker();
        worker.setEmail(email);
        worker.setPassword(passwordEncoder.encode(password));
        worker.setFirstName(firstName);
        worker.setLastName(lastName);
        worker.setRole(role);

        Worker savedWorker = workerRepository.save(worker);
        String token = jwtTokenUtil.generateToken(savedWorker.getEmail(), savedWorker.getId(), "WORKER", "Преподаватель");

        return new AuthResponse(token, savedWorker.getId(), savedWorker.getEmail(), "WORKER", "Преподаватель");
    }

    public AuthResponse authenticateStudent(AuthRequest request) {
        Student student = studentRepository.findByEmail(request.email())
                .orElseThrow(() -> new UsernameNotFoundException("Student not found"));

        if (!passwordEncoder.matches(request.password(), student.getPassword())) {
            throw new BadCredentialsException("Invalid password");
        }

        String token = jwtTokenUtil.generateToken(student.getEmail(), student.getId(), "STUDENT","Студент");
        return new AuthResponse(token, student.getId(), student.getEmail(), "STUDENT", "Студент");
    }

    public AuthResponse authenticateWorker(AuthRequest request) {
        Worker worker = workerRepository.findByEmail(request.email())
                .orElseThrow(() -> new UsernameNotFoundException("Worker not found"));

        if (!passwordEncoder.matches(request.password(), worker.getPassword())) {
            throw new BadCredentialsException("Invalid password");
        }

        if (worker.getRole().getName().equals("Преподаватель")) {
            String token = jwtTokenUtil.generateToken(
                    worker.getEmail(),
                    worker.getId(),
                    "TEACHER",
                    worker.getRole().getName()
            );
            return new AuthResponse(
                    token,
                    worker.getId(),
                    worker.getEmail(),
                    "TEACHER",
                    worker.getRole().getName()
            );
        }
        else {
            String token = jwtTokenUtil.generateToken(
                    worker.getEmail(),
                    worker.getId(),
                    "ADMIN",
                    worker.getRole().getName()
            );
            return new AuthResponse(
                    token,
                    worker.getId(),
                    worker.getEmail(),
                    "ADMIN",
                    worker.getRole().getName()
            );
        }
    }
}