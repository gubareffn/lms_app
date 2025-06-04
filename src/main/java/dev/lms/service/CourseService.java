package dev.lms.service;

import dev.lms.dto.CourseDetailsDto;
import dev.lms.dto.CourseShortDto;
import dev.lms.models.Course;
import dev.lms.models.Group;
import dev.lms.models.Worker;
import dev.lms.repository.CourseCategoryRepository;
import dev.lms.repository.CourseRepository;
import dev.lms.repository.CourseStatusRepository;
import dev.lms.repository.WorkerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {
    private final CourseRepository courseRepository;
    private final CourseCategoryRepository courseCategoryRepository;
    private final CourseStatusRepository courseStatusRepository;
    private final WorkerRepository workerRepository;


    public List<CourseShortDto> getAllCourses() {
        return courseRepository.findAllWithRelations().stream()
                .map(CourseShortDto::new)
                .collect(Collectors.toList());
    }

    public List<CourseDetailsDto> getAllCoursesWithDetails() {
        return courseRepository.findAllWithRelations().stream()
                .map(CourseDetailsDto::new)
                .collect(Collectors.toList());
    }


    public CourseDetailsDto getCourseDetails(Integer id) {
        Course course = courseRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException ("Course not found with id: " + id));
        return new CourseDetailsDto(course);
    }

    public List<CourseShortDto> getAllCoursesByWorkerId(Integer id) {
        return courseRepository.findAllByWorkerId(id).stream()
                .map(CourseShortDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public Course createCourse(CourseDetailsDto courseDto, Integer workerId) {
        Course course = new Course();

        course.setCategory(courseCategoryRepository.findById(courseDto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Категория не найдена с id: ")));

        course.setStatus(courseStatusRepository.findById(courseDto.getStatusId())
                .orElseThrow(() -> new RuntimeException("Статус не найден с id:")));

        Worker worker = workerRepository.findByIdWithRelations(workerId)
                .orElseThrow(() -> new RuntimeException("Работник не найден"));

        course.setName(courseDto.getName());
        course.setDescription(courseDto.getDescription());
        course.setStudyDirection(courseDto.getStudyDirection());
        course.setStartDate(courseDto.getStartDate());
        course.setEndDate(courseDto.getEndDate());
        course.setHoursCount(courseDto.getHoursCount());
        course.setResultCompetence(courseDto.getResultCompetence());
        course.getWorker().add(worker);

        return courseRepository.save(course);
    }

    public void deleteCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Request not found with id: " + courseId));

        courseRepository.deleteById(courseId);
    }
}