package dev.lms.repository;

import dev.lms.models.Assignment;
import dev.lms.models.Group;
import dev.lms.models.Solution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SolutionRepository extends JpaRepository<Solution, Integer> {
    List<Solution> findAllByAssignmentId(Integer id);

    List<Solution> findAllSolutionsByStudentId(Integer id);
}
