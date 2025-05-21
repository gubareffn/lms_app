package dev.lms.repository;

import dev.lms.models.Request;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RequestRepository extends JpaRepository<Request, Integer> {
    List<Request> findByStudentId(Integer studentId);
    List<Request> findByCourseId(Integer courseId);
    Optional<Request> findByStudentIdAndCourseId(Integer studentId, Integer courseId);

    boolean existsByStudentIdAndCourseId(Long studentId, Integer courseId);
}
