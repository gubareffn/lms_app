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


    @Query("SELECT s, s.request.student FROM StudyingProgress s JOIN FETCH s.status WHERE s.request.group.id = :groupId")
    List<StudyingProgress> findAllStudentsByGroupId(@Param("groupId") Integer groupId);

    @Query(value = "SELECT * FROM studying_progress WHERE request_id = :requestId", nativeQuery = true)
    StudyingProgress findByRequestId(@Param("requestId") Integer requestId);

//    @Query("SELECT s FROM StudyingProgress s WHERE s.request.id = :requestId")
//    StudyingProgress findByRequestId(@Param("requestId") Integer requestId);

    @Query("SELECT s, s.request.course, s.request  FROM StudyingProgress s JOIN FETCH s.status WHERE s.request.student.id = :studentId AND s.request.status.name LIKE 'Одобрена'")
    List<StudyingProgress> findAllCoursesWithProgress(@Param("studentId") Integer studentId);



}
