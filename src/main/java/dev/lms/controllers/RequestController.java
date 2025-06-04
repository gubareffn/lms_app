package dev.lms.controllers;

import dev.lms.dto.*;
import dev.lms.jwt.JwtCore;
import dev.lms.models.*;
import dev.lms.repository.*;
import dev.lms.service.RequestService;
import dev.lms.service.StudyingProgressService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {
    private final RequestService requestService;
    private final JwtCore jwtCore;
    private final RequestRepository requestRepository;
    private final RequestStatusRepository requestStatusRepository;
    private final WorkerRepository workerRepository;
    private final GroupRepository groupRepository;
    private final StudyingProgressService studyingProgressService;

    // Получение списка всех заявок
    @GetMapping
    public ResponseEntity<List<RequestDTOBuilder>> getAllRequests() {
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
            RequestDto createdRequest = requestService.createRequest(dto, studentId.longValue());
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

        Integer groupId = requestBody.get("groupId");
        Group group = groupRepository.findById(groupId).orElse(null);
        if (group == null) {
            return ResponseEntity.status(404).body("Group not found");
        }

        if (Objects.equals(updateStatus.getName(), "Одобрена")) {
            studyingProgressService.createNewProgress(updateRequest);
        }
        updateRequest.setWorker(worker);
        updateRequest.setGroup(group);
        updateRequest.setStatus(updateStatus);

        requestRepository.save(updateRequest);
        RequestDto updatedStatus = new RequestDto(updateRequest);
        return ResponseEntity.ok(updatedStatus);
    }

    // Удаление пользователя из группы (смена айди группы в заявке на 0)
    @Transactional
    @PutMapping("/{requestId}/group")
    public ResponseEntity<?> deleteStudentFromGroup(@PathVariable Integer requestId) {

        Request updateRequest = requestRepository.findById(requestId).orElse(null);
        if (updateRequest == null) {
            return ResponseEntity.status(404).body("Request not found");
        }

        updateRequest.setGroup(null);

        requestRepository.save(updateRequest);
        RequestDto updatedGroup = new RequestDto(updateRequest);
        return ResponseEntity.ok(updatedGroup);
    }

    // Обновление статуса заявки при смене статуса
    @Transactional
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
        RequestDto updatedComment = new RequestDto(updateRequest);
        return ResponseEntity.ok(updatedComment);
    }

    //  Удаление заявки
    @DeleteMapping("/{id}/delete")
    public ResponseEntity<?> deleteRequest(@PathVariable Integer id){
        requestService.deleteRequest(id);
        return  ResponseEntity.ok("Request deleted");
    }

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
            List<RequestDTOBuilder> requests = requestService.getRequestsByStudent(studentId);
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

    @GetMapping("/groups/{selectedGroup}/students")
    public ResponseEntity<?> getStudentsByGroup(HttpServletRequest request, @PathVariable Integer selectedGroup) {
        Group group = groupRepository.findById(selectedGroup).orElse(null);
        if (group == null) {
            return ResponseEntity.status(404).body("Group not found");
        }

        List<StudentRegistrationDto> students = requestService.getAllStudentsByGroup(selectedGroup);

        return ResponseEntity.ok(students);
    }
}