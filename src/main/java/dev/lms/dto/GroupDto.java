package dev.lms.dto;

import dev.lms.models.Group;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class GroupDto {
    private Integer id;
    private Integer courseId;
    private String courseName;
    private String name;
    private Integer studentCount;
    private Integer maxStudentCount;

    public GroupDto(Group group) {
        this.id = group.getId();
        this.courseId = group.getCourse().getId();
        this.courseName = group.getCourse().getName();
        this.name = group.getName();
        this.studentCount = group.getStudentCount();
        this.maxStudentCount = group.getMaxStudentCount();
    }
}
