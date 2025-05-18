package dev.lms.repository;

import dev.lms.models.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("SELECT c FROM Course c JOIN FETCH c.status JOIN FETCH c.category")
    List<Course> findAllWithRelations();

//    @Query("SELECT c FROM Course c LEFT JOIN FETCH c.assignments " +
//            "JOIN FETCH c.status JOIN FETCH c.category WHERE c.id = :id")
    @Query("SELECT c FROM Course c WHERE c.id = :id")
    Optional<Course> findByIdWithDetails(@Param("id") Integer id);
}