package dev.lms.dto;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Data
@Builder
public class RequestDTO {
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
    private String courseName;       // Добавлено

}

