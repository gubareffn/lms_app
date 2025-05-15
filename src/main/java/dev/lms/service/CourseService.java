package dev.lms.service;

import dev.lms.dto.CourseShortDto;
import dev.lms.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {
    private final CourseRepository courseRepository;

    public List<CourseShortDto> getAllCourses() {
        return courseRepository.findAllWithRelations().stream()
                .map(CourseShortDto::new)
                .collect(Collectors.toList());
    }

}