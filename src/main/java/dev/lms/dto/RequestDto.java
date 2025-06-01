package dev.lms.dto;

import dev.lms.models.Request;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class RequestDto {
    private Integer id;
    private Integer studentId;
    private Integer courseId;
    private Integer statusId;
    private Integer groupId;
    private String status;
    private String groupName;
    private LocalDateTime createTime;
    private LocalDateTime processingTime;
    private String requestText;
    private String courseName;
    private String studentFirstName;
    private String studentMiddleName;
    private String studentLastName;

    public RequestDto(Request request) {
        this.id = request.getId();
        this.studentId = request.getStudent().getId();
        this.courseId = request.getCourse().getId();
        this.statusId = request.getStatus().getId();
        if(request.getGroup() != null)
            this.groupId = request.getGroup().getId();
        this.status = request.getStatus().getName();
        if(request.getGroup() != null)
            this.groupName = request.getGroup().getName();
        this.createTime = request.getCreateTime();
        this.processingTime = request.getProcessingTime();
        this.requestText = request.getRequestText();
        this.courseName = request.getCourse().getName();
        this.studentFirstName = request.getStudent().getFirstName();
        this.studentMiddleName = request.getStudent().getMiddleName();
        this.studentLastName = request.getStudent().getLastName();
    }
}
