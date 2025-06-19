package dev.lms.repository;

import dev.lms.models.Solution;
import dev.lms.models.SolutionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SolutionStatusRepository extends JpaRepository<SolutionStatus, Integer> {
}
