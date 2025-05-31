package dev.lms.repository;

import dev.lms.models.Course;
import dev.lms.models.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    @Query("SELECT d FROM Document d WHERE d.student.id = :studentId")
    List<Document> findByStudentId(@Param("studentId") Long studentId);
}
