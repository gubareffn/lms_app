package dev.lms.repository;

import dev.lms.models.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssignmentRepository extends JpaRepository<Assignment, Integer> {
    List<Assignment> findAllByCourseId(Integer id);

    Optional<Assignment> findById(Integer id);
}
