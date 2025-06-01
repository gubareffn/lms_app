package dev.lms.dto;

import dev.lms.models.Worker;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkerListDto {
    private Integer id;
    private String lastName;
    private String firstName;
    private String middleName;
    private String email;
    private String role;

    public WorkerListDto(Worker worker) {
        this.id = worker.getId();
        this.email = worker.getEmail();
        this.middleName = worker.getMiddleName();
        this.firstName = worker.getFirstName();
        this.lastName = worker.getLastName();
        this.role = worker.getRole().getName();
    }
}
