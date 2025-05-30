package dev.lms.repository;

import dev.lms.models.Request;
import dev.lms.models.Student;
import dev.lms.models.StudyingProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudyingProgressRepository extends JpaRepository<StudyingProgress, Integer> {
    Optional<StudyingProgress> findByRequest(Request request);


    @Query("SELECT e.request FROM StudyingProgress e WHERE e.request.g = :groupId")
    List<Request> findAllProgress(@Param("groupId") Integer groupId);

}
