package dev.lms.service;

import dev.lms.dto.GroupDto;
import dev.lms.models.Category;
import dev.lms.models.Course;
import dev.lms.models.CourseStatus;
import dev.lms.models.Group;
import dev.lms.repository.CourseCategoryRepository;
import dev.lms.repository.CourseStatusRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CourseCategoryService {
    private final CourseCategoryRepository courseCategoryRepository;

    public CourseCategoryService(CourseCategoryRepository courseCategoryRepository) {
        this.courseCategoryRepository = courseCategoryRepository;
    }

    public List<Category> getAllCategories() {
        return courseCategoryRepository.findAll();
    }

    @Transactional
    public Category createCategory(Category category) {
        return courseCategoryRepository.save(category);
    }


}
