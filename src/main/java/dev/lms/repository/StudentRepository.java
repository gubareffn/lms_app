package dev.lms.repository;

import dev.lms.models.Course;
import dev.lms.models.Student;
import org.apache.catalina.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    @Query(value = "select s from Student s")
    List<Student> findAllWithRelations();

    Optional<Student> findByEmail(String email);

}
