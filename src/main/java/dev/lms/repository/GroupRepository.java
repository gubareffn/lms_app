package dev.lms.repository;

import dev.lms.models.Course;
import dev.lms.models.EducationMaterial;
import dev.lms.models.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GroupRepository extends JpaRepository<Group, Integer> {
    @Query("SELECT g FROM Group g WHERE g.course.id = :id")
    List<Group> findAllByCourseId(@Param("id") Integer id);

//    List<Group> findAllByCourseId(Integer courseId);
}
