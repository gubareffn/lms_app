package dev.lms.repository;

import dev.lms.models.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CourseCategoryRepository extends JpaRepository<Category, Integer> {
    Category findByName(String name);
}
