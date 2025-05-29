package dev.lms.repository;

import dev.lms.models.CourseStatus;
import dev.lms.models.EducationMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CourseStatusRepository  extends JpaRepository<CourseStatus, Integer> {
    CourseStatus findByName(String name);
}
