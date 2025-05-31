package dev.lms.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "document_type")
public class DocumentType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "doc_type_id")
    private Integer id;

    @Column(name = "doc_type_name", nullable = false, length = 100)
    private String name;
}

