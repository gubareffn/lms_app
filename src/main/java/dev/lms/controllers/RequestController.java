package dev.lms.controllers;

import dev.lms.dto.CreateRequestDTO;
import dev.lms.dto.RequestDTO;
import dev.lms.jwt.JwtCore;
import dev.lms.service.RequestService;
import io.jsonwebtoken.Jwt;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {
    private final RequestService requestService;
    private final JwtCore jwtCore;

    @PostMapping
    public ResponseEntity<?> createRequest(
            @RequestBody CreateRequestDTO dto,
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

            // Создаем заявку
            RequestDTO createdRequest = requestService.createRequest(dto, studentId.longValue());
            return ResponseEntity.ok(createdRequest);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
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

            // Получаем заявки студента
            List<RequestDTO> requests = requestService.getRequestsByStudent(studentId.longValue());
            return ResponseEntity.ok(requests);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching requests: " + e.getMessage());
        }
    }
}