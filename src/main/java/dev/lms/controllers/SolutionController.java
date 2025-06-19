package dev.lms.controllers;

import dev.lms.dto.*;
import dev.lms.jwt.JwtCore;
import dev.lms.models.Request;
import dev.lms.models.Solution;
import dev.lms.models.Worker;
import dev.lms.repository.SolutionRepository;
import dev.lms.repository.WorkerRepository;
import dev.lms.service.SolutionService;
import io.jsonwebtoken.Jwt;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/solutions")
@RequiredArgsConstructor
public class SolutionController {
    private final SolutionService solutionService;
    private final JwtCore jwtCore;
    private final SolutionRepository solutionRepository;
    private final WorkerRepository workerRepository;

    // Получения списка решений по айди задачи
    @GetMapping("/{assignmentId}")
    public ResponseEntity<List<SolutionsDto>> getAllSolutionsByAssignmentId(@PathVariable Integer assignmentId) {
        List<SolutionsDto> solutions = solutionService.getSolutionsByAssignmentId(assignmentId);
        return ResponseEntity.ok(solutions);
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyRequests(HttpServletRequest request) {
        try {
            // Получаем токен из заголовка Authorization
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }

            String token = authHeader.substring(7);

            // Проверяем валидность токена
            if (!jwtCore.validateToken(token)) {
                return  ResponseEntity.status(401).body("Invalid token");
            }

            Integer studentId = jwtCore.getUserIdFromToken(token);

            // Получаем заявки студента
            List<SolutionsDto> solutions = solutionService.getSolutionsByStudentId(studentId);
            return ResponseEntity.ok(solutions);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching requests: " + e.getMessage());
        }
    }

    // Создание решения
    @PostMapping("/add")
    public ResponseEntity<?> createRequest(
            @RequestBody SolutionsDto solutionsDto,
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

            // Создаем заявку
            SolutionsDto createdSolution = solutionService.addSolution(solutionsDto, studentId.longValue());
            return ResponseEntity.ok(createdSolution);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Transactional
    @PutMapping("/{solutionId}/grade")
    public ResponseEntity<?> updateRequest(@PathVariable Integer solutionId,
                                           @RequestBody Map<String, String> requestBody,
                                           HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);

        // Проверяем валидность токена
        if (!jwtCore.validateToken(token)) {
            return  ResponseEntity.status(401).body("Invalid token");
        }

        // Извлекаем ID работника из токена
        Integer workerId = jwtCore.getUserIdFromToken(token);
        Worker worker = workerRepository.findById(workerId);

        Solution updateSolution = solutionRepository.findById(solutionId).orElse(null);
        if (updateSolution == null) {
            return ResponseEntity.status(404).body("Request not found");
        }

        Integer score = Integer.valueOf(requestBody.get("solutionScore"));

        updateSolution.setSolutionScore(score);
        updateSolution.setWorker(worker);

        solutionRepository.save(updateSolution);

        return ResponseEntity.ok(new SolutionsDto(updateSolution));
    }

}
