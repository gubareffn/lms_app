package dev.lms.service;

import dev.lms.dto.CourseShortDto;
import dev.lms.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {
    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public List<CourseShortDto> getAllCourses() {
        return courseRepository.findAllWithRelations().stream()
                .map(CourseShortDto::new)
                .collect(Collectors.toList());
    }
}