package dev.lms.repository;

import dev.lms.models.Course;
import dev.lms.models.EducationMaterial;
import dev.lms.models.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EducationMaterialRepository extends JpaRepository<EducationMaterial, Integer> {
    @Query("SELECT e FROM EducationMaterial e JOIN FETCH e.course WHERE e.course.id = :id")
    List <EducationMaterial> findAllMaterialsByCourseId(@Param("id") Integer id);

    List <EducationMaterial> findAllByCourseId(Integer id);

}
