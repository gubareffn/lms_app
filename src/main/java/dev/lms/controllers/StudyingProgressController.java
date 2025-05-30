package dev.lms.controllers;

import dev.lms.dto.EducationMaterialDto;
import dev.lms.dto.StudentRegistrationDto;
import dev.lms.dto.StudentWithProgressDto;
import dev.lms.jwt.JwtCore;
import dev.lms.dto.StudyingProgressDto;
import dev.lms.models.EducationMaterial;
import dev.lms.models.Group;
import dev.lms.models.StudyingProgress;
import dev.lms.models.StudyingStatus;
import dev.lms.repository.GroupRepository;
import dev.lms.repository.StudyingProgressRepository;
import dev.lms.repository.StudyingStatusRepository;
import dev.lms.service.StudyingProgressService;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class StudyingProgressController {
    private final StudyingProgressService progressService;
    private final GroupRepository groupRepository;
    private final JwtCore jwtCore;
    private final StudyingProgressRepository studyingProgressRepository;
    private final StudyingStatusRepository studyingStatusRepository;

    //Получение прогресса по айди курса
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

    //Получение списка студентов по группе
    @GetMapping("/groups/{selectedGroup}/students")
    public ResponseEntity<?> getStudentsByGroup(HttpServletRequest request, @PathVariable Integer selectedGroup) {
        Group group = groupRepository.findById(selectedGroup).orElse(null);
        if (group == null) {
            return ResponseEntity.status(404).body("Group not found");
        }

        List<StudentWithProgressDto> students = progressService.getAllStudentsWithProgressByGroup(selectedGroup);

        return ResponseEntity.ok(students);
    }

    //Обновление статуса обучения
    @PutMapping("/{requestId}/update/status")
    public ResponseEntity<?> updateStudyingStatus(@PathVariable Integer requestId,
                                           @RequestBody Map<String, String> requestBody) {

        StudyingProgress progress = studyingProgressRepository.findByRequestId(requestId);
        if (progress == null) {
            return ResponseEntity.status(404).body("Progress not found");
        }

        StudyingStatus status = studyingStatusRepository.findByName(requestBody.get("status"));

        progress.setStatus(status);

        studyingProgressRepository.save(progress);
        return ResponseEntity.ok(progress);
    }
}
