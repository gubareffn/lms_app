package dev.lms.controllers;

import dev.lms.dto.*;
import dev.lms.jwt.JwtCore;
import dev.lms.models.Passport;
import dev.lms.models.Request;
import dev.lms.models.Student;
import dev.lms.repository.PassportRepository;
import dev.lms.repository.StudentRepository;
import dev.lms.service.PassportService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/passport")
@RequiredArgsConstructor
public class PassportController {
    private final PassportRepository passportRepository;
    private final StudentRepository studentRepository;
    private final PassportService passportService;
    private final JwtCore jwtCore;

    //  Получение паспорта по айди студента
    @GetMapping("/student/{studentId}")
    public ResponseEntity<Passport> getPassportByStudentId(@PathVariable Integer studentId) {
        return ResponseEntity.ok(passportService.getPassportByStudentId(studentId));
    }

    //  Добавление паспорта
    @Transactional
    @PostMapping("/add")
    public ResponseEntity<?> addPassport(
            @RequestBody Map<String, String> requestBody,
            HttpServletRequest request) {
        try {
            // Получаем токен из заголовка Authorization
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }

            String token = authHeader.substring(7);

            // Проверяем валидность токена
            if (!jwtCore.validateToken(token)) {
                return ResponseEntity.status(401).body("Invalid token");
            }

            Integer studentId = jwtCore.getUserIdFromToken(token);

            if (studentId == null) {
                return ResponseEntity.status(403).body("Student ID not found in token");
            }

            Student student = studentRepository.findStudentById(studentId);

            // Добавление паспорта
            Passport createdPassport = new Passport();
            createdPassport.setStudent(student);
            createdPassport.setDateOfBirth(LocalDate.parse(requestBody.get("dateOfBirth")));
            createdPassport.setSeries(requestBody.get("series"));
            createdPassport.setNumber(requestBody.get("number"));
            createdPassport.setIssuedBy(requestBody.get("issuedBy"));
            createdPassport.setIssuedDate(LocalDate.parse(requestBody.get("issuedDate")));

            passportRepository.save(createdPassport);

            return ResponseEntity.ok(new PassportDto(createdPassport));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Transactional
    @PutMapping("/update")
    public ResponseEntity<?> updatePassport(@RequestBody Map<String, String> requestBody, HttpServletRequest request) {
        try {
            // Получаем токен из заголовка Authorization
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }

            String token = authHeader.substring(7);

            // Проверяем валидность токена
            if (!jwtCore.validateToken(token)) {
                return ResponseEntity.status(401).body("Invalid token");
            }

            Integer studentId = jwtCore.getUserIdFromToken(token);

            if (studentId == null) {
                return ResponseEntity.status(403).body("Student ID not found in token");
            }

            Student student = studentRepository.findStudentById(studentId);

            // Обновление паспорта
            Passport updatePassport = passportRepository.findByStudentId(studentId);
            if (updatePassport == null) {
                return ResponseEntity.status(404).body("Request not found");
            }
            updatePassport.setStudent(student);
            updatePassport.setDateOfBirth(LocalDate.parse(requestBody.get("dateOfBirth")));
            updatePassport.setSeries(requestBody.get("series"));
            updatePassport.setNumber(requestBody.get("number"));
            updatePassport.setIssuedBy(requestBody.get("issuedBy"));
            updatePassport.setIssuedDate(LocalDate.parse(requestBody.get("issuedDate")));

            passportRepository.save(updatePassport);

            return ResponseEntity.ok(updatePassport);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
