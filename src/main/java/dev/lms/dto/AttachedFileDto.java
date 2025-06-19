package dev.lms.dto;

import dev.lms.models.AttachedFile;
import dev.lms.models.Document;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
public class AttachedFileDto {
    private Integer id;
    private String fileName;
    private String fileExtension;
    private String urlAddress;
    private Integer taskId;

    public AttachedFileDto(AttachedFile file) {
        this.id = file.getId();
        this.fileName = file.getFileName();
        this.urlAddress = file.getUrlAddress();
        this.taskId = file.getAssignment().getId();
    }
}
