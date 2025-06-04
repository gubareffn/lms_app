package dev.lms.controllers;

import dev.lms.dto.GroupDto;
import dev.lms.models.Category;
import dev.lms.models.CourseStatus;
import dev.lms.repository.CourseCategoryRepository;
import dev.lms.service.CourseCategoryService;
import dev.lms.service.CourseStatusService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/create")
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        Category group = courseCategoryService.createCategory(category);
        return ResponseEntity.ok(group);
    }

    @DeleteMapping("/{id}/delete")
    public ResponseEntity<?> deleteGroup(@PathVariable Integer id){
        courseCategoryService.deleteCategory(id);
        return  ResponseEntity.ok("Group deleted");
    }
}
