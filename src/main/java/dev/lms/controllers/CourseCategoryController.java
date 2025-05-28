package dev.lms.controllers;

import dev.lms.models.Category;
import dev.lms.models.CourseStatus;
import dev.lms.service.CourseCategoryService;
import dev.lms.service.CourseStatusService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/category")
public class CourseCategoryController {
    private final CourseCategoryService courseCategoryService;

    public CourseCategoryController(CourseCategoryService courseCategoryService) {
        this.courseCategoryService = courseCategoryService;
    }

    @GetMapping
    public List<Category> getAllCategories() {
        return courseCategoryService.getAllCategories();
    }

}
