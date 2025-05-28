package dev.lms.repository;


import dev.lms.models.Request;
import dev.lms.models.Student;
import dev.lms.models.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WorkerRepository extends JpaRepository<Worker, Long> {
    @Query("SELECT w FROM Worker w JOIN FETCH w.role where w.role.id=1")
    List<Worker> findAllTeachers();

    @Query("SELECT w FROM Worker w JOIN FETCH w.role where w.role.id=2")
    List<Worker> findAllAdmins();

    @Query("SELECT w FROM Worker w JOIN FETCH w.role")
    List<Worker> findAllWithRoles();

    @Query("SELECT w FROM Worker w JOIN FETCH w.role where w.email=:email")
    Optional<Worker> findByEmail(@Param(value = "email") String email);

//    Optional<Worker> findByEmail(String email);


    @Query("SELECT w FROM Worker w JOIN FETCH w.role WHERE w.id = :workerId")
    Optional<Worker> findById(@Param("workerId") Integer workerId);


    boolean existsByEmail(String email);
}
