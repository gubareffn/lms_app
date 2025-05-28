package dev.lms.controllers;

import dev.lms.dto.CourseDetailsDto;
import dev.lms.dto.CourseShortDto;
import dev.lms.dto.RequestDTO;
import dev.lms.jwt.JwtCore;
import dev.lms.models.Course;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import dev.lms.service.CourseService;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {
    private final CourseService courseService;
    private final JwtCore jwtCore;

    @GetMapping
    public ResponseEntity<List<CourseShortDto>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDetailsDto> getCourseById(@PathVariable Integer id) {
        CourseDetailsDto courseDetails = courseService.getCourseDetails(id);
        return ResponseEntity.ok(courseDetails);
    }

    // Получение списка курсов работника
    @GetMapping("/my")
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

            // Извлекаем ID работника из токена
            Integer workerId = (Integer) Jwts.parser()
                    .setSigningKey(jwtCore.getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .get("id");

            if (workerId == null) {
                return ResponseEntity.status(403).body("Worker ID not found in token");
            }
            // Получаем заявки студента
            List<CourseShortDto> courses = courseService.getAllCoursesByWorkerId(workerId);
            return ResponseEntity.ok(courses);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching requests: " + e.getMessage());
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createCourse(@RequestBody CourseDetailsDto courseDto, HttpServletRequest request) {
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
        Integer workerId = (Integer) Jwts.parser()
                .setSigningKey(jwtCore.getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("id");

        if (workerId == null) {
            return ResponseEntity.status(403).body("Worker ID not found in token");
        }

        Course course = courseService.createCourse(courseDto, workerId);
        return ResponseEntity.ok(course);
    }


}
