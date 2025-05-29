package dev.lms.service;

import dev.lms.dto.EducationMaterialDto;
import dev.lms.models.Course;
import dev.lms.models.EducationMaterial;
import dev.lms.models.Group;
import dev.lms.repository.CourseRepository;
import dev.lms.repository.EducationMaterialRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EducationMaterialService {
    private final EducationMaterialRepository educationMaterialRepository;
    private final CourseRepository courseRepository;


    public EducationMaterialService(EducationMaterialRepository educationMaterialRepository, CourseRepository courseRepository) {
        this.educationMaterialRepository = educationMaterialRepository;
        this.courseRepository = courseRepository;
    }

    public List<EducationMaterialDto> getMaterialsByCourseId(Integer courseId) {
        List<EducationMaterial> materials = educationMaterialRepository.findAllByCourseId(courseId);
        return materials.stream()
                .map(EducationMaterialDto::new)
                .collect(Collectors.toList());
    }

    public EducationMaterialDto addMaterial(Integer courseId, EducationMaterialDto educationMaterialDto) {
        Course course = courseRepository.findById(Long.valueOf(courseId))
                .orElseThrow(() -> new RuntimeException("Курс не найден"));

        EducationMaterial educationMaterial = new EducationMaterial();
        educationMaterial.setCourse(course);
        educationMaterial.setName(educationMaterialDto.getName());
        educationMaterial.setText(educationMaterialDto.getText());
        educationMaterial.setAddingDate(LocalDateTime.now());
        EducationMaterial savedMaterial = educationMaterialRepository.save(educationMaterial);
        return new EducationMaterialDto(savedMaterial);
    }


    public void deleteMaterial(Integer materialId) {
        EducationMaterial material = educationMaterialRepository.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found with id: " + materialId));

        educationMaterialRepository.deleteById(materialId);
    }

}
