package dev.lms.controllers;

import dev.lms.dto.EducationMaterialDto;
import dev.lms.service.EducationMaterialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/material")
public class EducationMaterialController {
    private final EducationMaterialService educationMaterialService;

    public EducationMaterialController(EducationMaterialService educationMaterialService) {
        this.educationMaterialService = educationMaterialService;
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<List<EducationMaterialDto>> getAllMaterialsByCourseId(@PathVariable Integer courseId) {
        List<EducationMaterialDto> materials = educationMaterialService.getMaterialsByCourseId(courseId);
        return ResponseEntity.ok(materials);
    }
}
