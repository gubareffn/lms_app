package dev.lms.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table (name=("request_status"))
@Getter
@Setter
public class RequestStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_status_id")
    private Integer id;

    @Column(name = "name", nullable = false, length = 30)
    private String name;

}