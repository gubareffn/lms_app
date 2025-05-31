package dev.lms.dto;

import dev.lms.models.Course;
import dev.lms.models.Document;
import dev.lms.models.DocumentType;
import dev.lms.models.Student;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class DocumentDto {
    private Integer id;
    private String fileName;
    private LocalDateTime createDate;
    private String urlAddress;
    private Integer studentId;
    private String type;

    public DocumentDto(Document document) {
        this.id = document.getId();
        this.fileName = document.getFileName();
        this.createDate = document.getCreateDate();
        this.urlAddress = document.getUrlAddress();
        this.studentId = document.getStudent().getId();
        this.type = document.getType().getName();
    }
}
