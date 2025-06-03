package dev.lms.controllers;

import dev.lms.dto.CourseDetailsDto;
import dev.lms.dto.CourseShortDto;
import dev.lms.jwt.JwtCore;
import dev.lms.models.*;
import dev.lms.repository.CourseCategoryRepository;
import dev.lms.repository.CourseRepository;
import dev.lms.repository.CourseStatusRepository;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import dev.lms.service.CourseService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {
    private final CourseService courseService;
    private final JwtCore jwtCore;
    private final CourseRepository courseRepository;
    private final CourseCategoryRepository courseCategoryRepository;
    private final CourseStatusRepository courseStatusRepository;

    @GetMapping
    public ResponseEntity<List<CourseShortDto>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/details")
    public ResponseEntity<List<CourseDetailsDto>> getAllCoursesWithDetails() {
        return ResponseEntity.ok(courseService.getAllCoursesWithDetails());
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


    @PutMapping("/{id}/update")
    public ResponseEntity<?> updateCourse(@PathVariable Integer id,
                                           @RequestBody Map<String, String> requestBody) {

        Course updateCourse = courseRepository.findById(Long.valueOf(id)).orElse(null);
        if (updateCourse == null) {
            return ResponseEntity.status(404).body("Course not found");
        }

        Category category = courseCategoryRepository.findByName(requestBody.get("category"));
        CourseStatus status = courseStatusRepository.findByName(requestBody.get("status"));

        updateCourse.setName(requestBody.get("name"));
        updateCourse.setDescription(requestBody.get("description"));
        updateCourse.setStudyDirection(requestBody.get("studyDirection"));
        updateCourse.setStartDate(LocalDateTime.parse(requestBody.get("startDate")));
        updateCourse.setEndDate(LocalDateTime.parse(requestBody.get("endDate")));
        updateCourse.setResultCompetence(requestBody.get("resultCompetence"));
        updateCourse.setHoursCount(Integer.valueOf(requestBody.get("hoursCount")));
        updateCourse.setCategory(category);
        updateCourse.setStatus(status);

        courseRepository.save(updateCourse);
        return ResponseEntity.ok(new CourseDetailsDto(updateCourse));
    }
}
