package dev.lms.service;

import dev.lms.dto.EducationMaterialDto;
import dev.lms.models.EducationMaterial;
import dev.lms.repository.EducationMaterialRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EducationMaterialService {
    private final EducationMaterialRepository educationMaterialRepository;


    public EducationMaterialService(EducationMaterialRepository educationMaterialRepository) {
        this.educationMaterialRepository = educationMaterialRepository;
    }

    public List<EducationMaterialDto> getMaterialsByCourseId(Integer courseId) {
        List<EducationMaterial> materials = educationMaterialRepository.findAllByCourseId(courseId);
        return materials.stream()
                .map(EducationMaterialDto::new)
                .collect(Collectors.toList());
    }

//    public List<EducationMaterial> getAllMaterials(Integer courseId) {
//        return educationMaterialRepository.findAllByCourseId(courseId);
//    }
}
