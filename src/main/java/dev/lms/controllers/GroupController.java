package dev.lms.controllers;

import dev.lms.dto.CourseShortDto;
import dev.lms.models.Group;
import dev.lms.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @GetMapping
    public List<Group> getAllGroups() {
        return groupService.getAllGroups();
    }

    @GetMapping("/api/groups/{id}")
    public ResponseEntity<List<Group>> getAllGroupsByCourseId(@PathVariable int id) {
        return ResponseEntity.ok(groupService.getAllGroupsByCourseId(id));
    }
}
