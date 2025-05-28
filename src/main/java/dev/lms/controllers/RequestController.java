package dev.lms.controllers;

import dev.lms.dto.CourseShortDto;
import dev.lms.dto.CreateRequestDTO;
import dev.lms.dto.RequestDTO;
import dev.lms.jwt.JwtCore;
import dev.lms.models.Request;
import dev.lms.models.RequestStatus;
import dev.lms.models.Worker;
import dev.lms.repository.CourseRepository;
import dev.lms.repository.RequestRepository;
import dev.lms.repository.RequestStatusRepository;
import dev.lms.repository.WorkerRepository;
import dev.lms.service.RequestService;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {
    private final RequestService requestService;
    private final JwtCore jwtCore;
    private final RequestRepository requestRepository;
    private final RequestStatusRepository requestStatusRepository;
    private final WorkerRepository workerRepository;

    // Получение списка всех заявок
    @GetMapping
    public ResponseEntity<List<RequestDTO>> getAllRequests() {
        return ResponseEntity.ok(requestService.getAllRequests());
    }

    // Создание заявки
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

            Integer studentId = jwtCore.getUserIdFromToken(token);

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

    // Обновление статуса заявки при смене статуса
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateRequest(@PathVariable Integer id,
                                           @RequestBody Map<String, Integer> requestBody,
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

        Request updateRequest = requestRepository.findById(id).orElse(null);
        if (updateRequest == null) {
            return ResponseEntity.status(404).body("Request not found");
        }

        Integer statusId = requestBody.get("statusId");
        if (statusId == null) {
            return ResponseEntity.badRequest().body("Status ID must not be null");
        }

        RequestStatus updateStatus = requestStatusRepository.findById(statusId).orElse(null);
        if (updateStatus == null) {
            return ResponseEntity.status(404).body("Status not found");
        }

        updateRequest.setWorker(worker);
        updateRequest.setStatus(updateStatus);

        requestRepository.save(updateRequest);
        return ResponseEntity.ok(updateRequest);
    }

    // Обновление статуса заявки при смене статуса
    @PutMapping("/{id}/comment")
    public ResponseEntity<?> updateRequest(@PathVariable Integer id,
                                           @RequestBody Map<String, String> requestBody) {

        Request updateRequest = requestRepository.findById(id).orElse(null);
        if (updateRequest == null) {
            return ResponseEntity.status(404).body("Request not found");
        }

        String comment = requestBody.get("requestText");

        updateRequest.setRequestText(comment);

        requestRepository.save(updateRequest);
        return ResponseEntity.ok(updateRequest);
    }


    // Удаление заявки
//    @DeleteMapping
//    public ResponseEntity<?> deleteRequest(){
//
//    }

    // Получение списка заявок авторизованного пользователя
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
            List<RequestDTO> requests = requestService.getRequestsByStudent(studentId);
            return ResponseEntity.ok(requests);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching requests: " + e.getMessage());
        }
    }

    // Получение списка курсов авторизованного пользователя
    @GetMapping("/my-courses")
    public ResponseEntity<?> getMyCourses(HttpServletRequest request) {
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
            List<CourseShortDto> courses = requestService.getCoursesByStudent(studentId);
            return ResponseEntity.ok(courses);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching requests: " + e.getMessage());
        }
    }

}