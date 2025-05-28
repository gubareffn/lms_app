package dev.lms.controllers;

import dev.lms.dto.CourseShortDto;
import dev.lms.models.CourseStatus;
import dev.lms.models.Student;
import dev.lms.service.CourseStatusService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/status")
public class CourseStatusController {
    private final CourseStatusService courseStatusService;

    public CourseStatusController(CourseStatusService courseStatusService) {
        this.courseStatusService = courseStatusService;
    }

    @GetMapping
    public List<CourseStatus> getAllStatus() {
        return courseStatusService.getAll();
    }
}
