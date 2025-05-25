package dev.lms.repository;

import dev.lms.models.StudyingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudyingStatusRepository extends JpaRepository<StudyingStatus, Integer> {
}
