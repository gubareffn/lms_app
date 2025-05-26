package dev.lms.controllers;

import dev.lms.jwt.JwtCore;
import dev.lms.dto.StudyingProgressDto;
import dev.lms.service.StudyingProgressService;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class StudyingProgressController {
    private final StudyingProgressService progressService;
    private final JwtCore jwtCore;

    @GetMapping("/{courseId}")
    public ResponseEntity<?> getProgress(
            @PathVariable Integer courseId,
            HttpServletRequest request) {
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

        // Извлекаем ID студента из токена
        Integer studentId = (Integer) Jwts.parser()
                .setSigningKey(jwtCore.getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("id");

        if (studentId == null) {
            return ResponseEntity.status(403).body("Student ID not found in token");
        }

        StudyingProgressDto progress = progressService.getProgress(studentId, courseId);
        return ResponseEntity.ok(progress);
    }

    @PostMapping
    public ResponseEntity<?> updateProgress(
            @RequestBody StudyingProgressDto progressDto,
            HttpServletRequest request) {

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

        // Извлекаем ID студента из токена
        Integer studentId = (Integer) Jwts.parser()
                .setSigningKey(jwtCore.getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("id");

        if (studentId == null) {
            return ResponseEntity.status(403).body("Student ID not found in token");
        }


        progressService.updateProgress(studentId, progressDto);
        return ResponseEntity.ok().build();
    }
}
