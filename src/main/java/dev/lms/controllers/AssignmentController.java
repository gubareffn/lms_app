package dev.lms.controllers;

import dev.lms.dto.AssignmentDto;
import dev.lms.dto.EducationMaterialDto;
import dev.lms.models.Assignment;
import dev.lms.models.EducationMaterial;
import dev.lms.repository.AssignmentRepository;
import dev.lms.repository.EducationMaterialRepository;
import dev.lms.service.AssignmentService;
import dev.lms.service.EducationMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {
    private final AssignmentService assignmentService;
    private final AssignmentRepository assignmentRepository;

    @GetMapping("/{courseId}")
    public ResponseEntity<List<AssignmentDto>> getAllMaterialsByCourseId(@PathVariable Integer courseId) {
        List<AssignmentDto> assignments = assignmentService.getAssignmentsByCourseId(courseId);
        return ResponseEntity.ok(assignments);
    }

    @PostMapping("/{courseId}/add")
    public ResponseEntity<?> createAssignment(@PathVariable Integer courseId, @RequestBody AssignmentDto assignmentDto) {

        assignmentDto.setCourseId(courseId);

        assignmentService.addAssignment(courseId, assignmentDto);
        return  ResponseEntity.ok(assignmentDto);
    }

    @PutMapping("/{id}/update")
    public ResponseEntity<?> updateAssignment(@PathVariable Integer id,
                                           @RequestBody Map<String, String> requestBody) {

        Assignment updateAssignment = assignmentRepository.findById(id).orElse(null);
        if (updateAssignment == null) {
            return ResponseEntity.status(404).body("Material not found");
        }

        updateAssignment.setAssignmentName(requestBody.get("assignmentName"));
        updateAssignment.setAssignmentDescription(requestBody.get("assignmentDescription"));
        updateAssignment.setDeadline(LocalDateTime.parse(requestBody.get("deadline")));
        assignmentRepository.save(updateAssignment);
        return ResponseEntity.ok(new AssignmentDto(updateAssignment));
    }

    @DeleteMapping("/{id}/delete")
    public ResponseEntity<?> deleteAssignment(@PathVariable Integer id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.ok("Material deleted");
    }
}
