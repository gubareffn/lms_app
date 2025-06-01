package dev.lms.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "document")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id")
    private Integer id;

    @Column(name = "doc_file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "create_date", nullable = false)
    private LocalDateTime createDate;

    @Column(name = "url_address", nullable = false)
    private String urlAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doc_type_id")
    private DocumentType type;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "worker_document",
            joinColumns = @JoinColumn(name = "document_id"),
            inverseJoinColumns = @JoinColumn(name = "worker_id")
    )
    private Set<Worker> worker = new HashSet<Worker>();
}
