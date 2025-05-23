package dev.lms.dto;

import dev.lms.models.Request;
import jdk.jshell.Snippet;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.antlr.v4.runtime.misc.NotNull;

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
//    private Integer groupId;
    private String status;
    private LocalDateTime createTime;
    private LocalDateTime processingTime;
    private String requestText;
    private String courseName;       // Добавлено

}

