package dev.lms.repository;

import dev.lms.dto.AttachedFileDto;
import dev.lms.models.AttachedFile;
import dev.lms.models.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AttachedFileRepository extends JpaRepository<AttachedFile, Integer> {
    @Query("SELECT a FROM AttachedFile a WHERE a.assignment.id = :assignmentId")
    List<AttachedFile> findAllByAssignmentId(@Param("assignmentId") Long assignmentId);
}
