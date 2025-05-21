package dev.lms.dto;

import lombok.Getter;
import lombok.Setter;
import org.antlr.v4.runtime.misc.NotNull;

@Getter
@Setter
public class CreateRequestDTO {
    @NotNull
    private Integer courseId;
    @NotNull
    private Integer studentId;

    private Integer groupId;

}