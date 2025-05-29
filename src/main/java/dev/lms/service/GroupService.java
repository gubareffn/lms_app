package dev.lms.service;

import dev.lms.models.Group;
import dev.lms.repository.GroupRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GroupService {
    GroupRepository groupRepository;

    public GroupService(GroupRepository groupRepository) {
        this.groupRepository = groupRepository;
    }

    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    public List<Group> getAllGroupsByCourseId(int courseId) {
        return groupRepository.findAllByCourseId(courseId);
    }
}
