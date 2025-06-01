package dev.lms.service;

import dev.lms.dto.GroupDto;
import dev.lms.models.Course;
import dev.lms.models.Group;
import dev.lms.repository.CourseRepository;
import dev.lms.repository.GroupRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {
    private final GroupRepository groupRepository;
    private final CourseRepository courseRepository;

    public List<GroupDto> getAllGroups() {
        return groupRepository.findAll().stream()
                .map(GroupDto::new)
                .collect(Collectors.toList());
    }

    public List<GroupDto> getAllGroupsByCourseId(Integer courseId) {
        return groupRepository.findAllByCourseId(courseId).stream()
                .map(GroupDto::new)
                .collect(Collectors.toList());
    }

    public void deleteGroup(Integer groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Request not found with id: " + groupId));

        groupRepository.deleteById(groupId);
    }

    @Transactional
    public GroupDto createGroup(GroupDto groupDto) {
        Group group = new Group();

        Course course = courseRepository.findById(groupDto.getCourseId());
        group.setName(groupDto.getName());
        group.setMaxStudentCount(groupDto.getMaxStudentCount());

        group.setCourse(course);
        Group addedGroup =  groupRepository.save(group);

        return new GroupDto(addedGroup);
    }
}
