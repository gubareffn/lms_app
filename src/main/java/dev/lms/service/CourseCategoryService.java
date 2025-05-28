package dev.lms.service;

import dev.lms.models.Category;
import dev.lms.models.CourseStatus;
import dev.lms.repository.CourseCategoryRepository;
import dev.lms.repository.CourseStatusRepository;
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


}
