package dev.lms.controllers;

import dev.lms.models.CourseStatus;
import dev.lms.models.DocumentType;
import dev.lms.service.CourseStatusService;
import dev.lms.service.DocumentTypeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/document-type")
public class DocumentTypeController {
    private final DocumentTypeService documentTypeService;

    public DocumentTypeController(DocumentTypeService documentTypeService) {
        this.documentTypeService = documentTypeService;
    }

    @GetMapping
    public List<DocumentType> getAllDocumentTypes() {
        return documentTypeService.getAllDocumentTypes();
    }
}
