package dev.lms.service;

import dev.lms.dto.RequestDTOBuilder;
import dev.lms.dto.RequestDto;
import dev.lms.dto.SolutionsDto;
import dev.lms.models.*;
import dev.lms.repository.AssignmentRepository;
import dev.lms.repository.SolutionRepository;
import dev.lms.repository.SolutionStatusRepository;
import dev.lms.repository.StudentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SolutionService {
    private final SolutionRepository solutionRepository;
    private final StudentRepository studentRepository;
    private final AssignmentRepository assignmentRepository;
    private final SolutionStatusRepository solutionStatusRepository;

    public List<SolutionsDto> getSolutionsByAssignmentId(Integer AssignmentId) {
        return solutionRepository.findAllByAssignmentId(AssignmentId).stream()
                .map(SolutionsDto::new)
                .collect(Collectors.toList());
    }

    public List<SolutionsDto> getSolutionsByStudentId(Integer studentId) {
        return solutionRepository.findAllSolutionsByStudentId(studentId).stream()
                .map(SolutionsDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public SolutionsDto addSolution(SolutionsDto dto, Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        Assignment assignment = assignmentRepository.findById(dto.getAssignmentId())
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + dto.getAssignmentId()));

        // Получаем статус "Не оценена" (id = 1)
        SolutionStatus defaultStatus = solutionStatusRepository.findById(1)
                .orElseThrow(() -> new RuntimeException("Default status not found"));

        // Создаем новое решение
        Solution solution = new Solution();
        solution.setSolutionComment(dto.getSolutionComment());
        solution.setStudent(student);
        solution.setAssignment(assignment);
        solution.setStatus(defaultStatus);
        solution.setSendingDate(LocalDateTime.now());
        // Сохраняем решение в базу
        Solution newSolution = solutionRepository.save(solution);
        return new SolutionsDto(newSolution);
    }


}
