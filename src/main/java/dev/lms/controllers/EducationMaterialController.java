package dev.lms.controllers;

import dev.lms.dto.EducationMaterialDto;
import dev.lms.models.Category;
import dev.lms.models.Course;
import dev.lms.models.CourseStatus;
import dev.lms.models.EducationMaterial;
import dev.lms.repository.EducationMaterialRepository;
import dev.lms.service.EducationMaterialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/material")
public class EducationMaterialController {
    private final EducationMaterialService educationMaterialService;
    private final EducationMaterialRepository educationMaterialRepository;

    public EducationMaterialController(EducationMaterialService educationMaterialService, EducationMaterialRepository educationMaterialRepository) {
        this.educationMaterialService = educationMaterialService;
        this.educationMaterialRepository = educationMaterialRepository;
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<List<EducationMaterialDto>> getAllMaterialsByCourseId(@PathVariable Integer courseId) {
        List<EducationMaterialDto> materials = educationMaterialService.getMaterialsByCourseId(courseId);
        return ResponseEntity.ok(materials);
    }

    @PostMapping("/{courseId}/add")
    public ResponseEntity<?> createMaterial(@PathVariable Integer courseId, @RequestBody EducationMaterialDto educationMaterialDto) {

        educationMaterialDto.setCourseId(courseId);

        educationMaterialService.addMaterial(courseId, educationMaterialDto);
        return  ResponseEntity.ok(educationMaterialDto);
    }

    @DeleteMapping("/{id}/delete")
    public ResponseEntity<?> deleteMaterial(@PathVariable Integer id){
        educationMaterialService.deleteMaterial(id);
        return  ResponseEntity.ok("Material deleted");
    }

    @PutMapping("/{id}/update")
    public ResponseEntity<?> updateMaterial(@PathVariable Integer id,
                                           @RequestBody Map<String, String> requestBody) {

        EducationMaterial updateMaterial = educationMaterialRepository.findById(id).orElse(null);
        if (updateMaterial == null) {
            return ResponseEntity.status(404).body("Material not found");
        }

        updateMaterial.setName(requestBody.get("name"));
        updateMaterial.setText(requestBody.get("text"));

        educationMaterialRepository.save(updateMaterial);
        return ResponseEntity.ok(new EducationMaterialDto(updateMaterial));
    }
}
