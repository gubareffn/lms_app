package dev.lms.service;

import dev.lms.dto.AssignmentDto;
import dev.lms.dto.EducationMaterialDto;
import dev.lms.models.Assignment;
import dev.lms.models.Course;
import dev.lms.models.EducationMaterial;
import dev.lms.repository.AssignmentRepository;
import dev.lms.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentService {
    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;

    public List<AssignmentDto> getAssignmentsByCourseId(Integer courseId) {
        List<Assignment> assignments = assignmentRepository.findAllByCourseId(courseId);
        return assignments.stream()
                .map(AssignmentDto::new)
                .collect(Collectors.toList());
    }

    public AssignmentDto addAssignment(Integer courseId, AssignmentDto assignmentDto) {
        Course course = courseRepository.findById(Long.valueOf(courseId))
                .orElseThrow(() -> new RuntimeException("Курс не найден"));

        Assignment assignment = new Assignment();
        assignment.setCourse(course);
        assignment.setAssignmentName(assignmentDto.getAssignmentName());
        assignment.setAssignmentDescription(assignmentDto.getAssignmentDescription());
        assignment.setDeadline(LocalDateTime.now());
        Assignment savedAssignment = assignmentRepository.save(assignment);
        return new AssignmentDto(savedAssignment);
    }


    public void deleteAssignment(Integer materialId) {
        Assignment assignment = assignmentRepository.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + materialId));

        assignmentRepository.deleteById(materialId);
    }

}
