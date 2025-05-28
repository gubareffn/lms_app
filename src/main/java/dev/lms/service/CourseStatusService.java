package dev.lms.service;

import dev.lms.models.CourseStatus;
import dev.lms.models.Student;
import dev.lms.repository.CourseStatusRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseStatusService {
    private final CourseStatusRepository courseStatusRepository;

    public CourseStatusService(CourseStatusRepository courseStatusRepository) {
        this.courseStatusRepository = courseStatusRepository;
    }

    public List<CourseStatus> getAll() {
        return courseStatusRepository.findAll();
    }


}
