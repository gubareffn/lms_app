package dev.lms.repository;

import dev.lms.models.Request;
import dev.lms.models.Student;
import dev.lms.models.StudyingProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudyingProgressRepository extends JpaRepository<StudyingProgress, Integer> {
    Optional<StudyingProgress> findByRequest(Request request);

}
