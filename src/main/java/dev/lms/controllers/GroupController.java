package dev.lms.controllers;

import dev.lms.dto.CourseShortDto;
import dev.lms.dto.GroupDto;
import dev.lms.models.Group;
import dev.lms.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {
    private final GroupService groupService;

    @GetMapping
    public List<GroupDto> getAllGroups() {
        return groupService.getAllGroups();
    }

    @GetMapping("/{id}")
    public ResponseEntity<List<GroupDto>> getAllGroupsByCourseId(@PathVariable Integer id) {
        return ResponseEntity.ok(groupService.getAllGroupsByCourseId(id));
    }

    @PostMapping("/create")
    public ResponseEntity<?> createGroup(@RequestBody GroupDto request) {
        GroupDto group = groupService.createGroup(request);
        return ResponseEntity.ok(group);
    }

    @DeleteMapping("/{id}/delete")
    public ResponseEntity<?> deleteGroup(@PathVariable Integer id){
        groupService.deleteGroup(id);
        return  ResponseEntity.ok("Group deleted");
    }
}
