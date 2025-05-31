package dev.lms.service;

import dev.lms.models.Category;
import dev.lms.models.Document;
import dev.lms.models.DocumentType;
import dev.lms.repository.CourseCategoryRepository;
import dev.lms.repository.DocumentTypeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DocumentTypeService {
    private final DocumentTypeRepository documentTypeRepository;

    public DocumentTypeService(DocumentTypeRepository documentTypeRepository) {
        this.documentTypeRepository = documentTypeRepository;
    }

    public List<DocumentType> getAllDocumentTypes() {
        return documentTypeRepository.findAll();
    }
}
