package dev.lms.dto;


import dev.lms.models.EducationMaterial;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EducationMaterialDto {
    private Integer id;
    private String name;
    private LocalDateTime addingDate;
    private String text;
    private Integer courseId;

    public EducationMaterialDto(EducationMaterial material) {
        this.id = material.getId();
        this.name = material.getName();
        this.addingDate = material.getAdding_date();
        this.text = material.getText();
        this.courseId = material.getCourse() != null ? material.getCourse().getId() : null;
    }
}
