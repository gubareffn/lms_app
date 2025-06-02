package dev.lms.repository;

import dev.lms.models.Group;
import dev.lms.models.Passport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PassportRepository  extends JpaRepository<Passport, Integer> {
    Passport findByStudentId(Integer studentId);
}
