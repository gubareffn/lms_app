package dev.lms.repository;

import dev.lms.models.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("SELECT c FROM Course c JOIN FETCH c.status JOIN FETCH c.category")
    List<Course> findAllWithRelations();

//    @Query("SELECT c FROM Course c LEFT JOIN FETCH c.assignments " +
//            "JOIN FETCH c.status JOIN FETCH c.category WHERE c.id = :id")
//    Optional<Course> findByIdWithAssignments(@Param("id") Long id);
}