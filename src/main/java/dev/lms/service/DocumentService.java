package dev.lms.service;

import dev.lms.dto.CourseShortDto;
import dev.lms.dto.DocumentDto;
import dev.lms.models.Document;
import dev.lms.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {
    private final DocumentRepository documentRepository;

    public List<DocumentDto> getAllDocumentsByStudentId(Long studentId) {
        return documentRepository.findByStudentId(studentId).stream()
                .map(DocumentDto::new)
                .collect(Collectors.toList());
    }
}
