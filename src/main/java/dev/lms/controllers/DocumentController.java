package dev.lms.controllers;


import dev.lms.dto.DocumentDto;
import dev.lms.dto.StudyingProgressDto;
import dev.lms.jwt.JwtCore;
import dev.lms.models.*;
import dev.lms.repository.*;
import dev.lms.service.DocumentService;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {
    private final StudentRepository studentRepository;
    private final WorkerRepository workerRepository;
    private final JwtCore jwtCore;
    private final DocumentRepository documentRepository;
    private final RequestRepository requestRepository;
    private final DocumentService documentService;
    private final DocumentTypeRepository documentTypeRepository;

    @Value("${upload.path}")
    private String uploadPath;

    @Transactional
    @PostMapping("/upload/by-student")
    public ResponseEntity<?> uploadDocument(@RequestParam("file") MultipartFile file,
                                            HttpServletRequest request,
                                            @RequestParam Integer documentTypeId) {
        try {
            // Получаем токен из заголовка Authorization
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }

            String token = authHeader.substring(7);

            // Проверяем валидность токена
            if (!jwtCore.validateToken(token)) {
                return  ResponseEntity.status(401).body("Invalid token");
            }

            DocumentType documentType = documentTypeRepository.findByTypeId(documentTypeId);

            Integer studentId = jwtCore.getUserIdFromToken(token);

            Student student = studentRepository.findStudentById(Long.valueOf(studentId));

            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }
            // Проверка типа файла
            if (!file.getContentType().equals("application/pdf")) {
                return ResponseEntity.badRequest().body("Only PDF documents are allowed");
            }

            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());

            if (originalFilename == null || originalFilename.isEmpty()) {
                return ResponseEntity.badRequest().body("File name is empty");
            }

            if (originalFilename.contains("..")) {
                return ResponseEntity.badRequest().body("Invalid file name");
            }

            // Подготовка пути сохранения
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists() && !uploadDir.mkdirs()) {
                throw new IOException("Failed to create upload directory");
            }

            String uuid = UUID.randomUUID().toString();
            String resultFileName = uuid + "_" + originalFilename;
            File destinationFile = new File(uploadDir, resultFileName);

            // Сохранение файла
            file.transferTo(destinationFile);

            // Создание записи в БД
            Document document = new Document();
            document.setFileName(resultFileName);
            document.setUrlAddress("/api/documents/download/" + resultFileName);
            document.setCreateDate(LocalDateTime.now());
            document.setStudent(student);
            document.setType(documentType);

            Document savedDocument = documentRepository.save(document);
            DocumentDto documentDto = new DocumentDto(savedDocument);

            return ResponseEntity.ok(documentDto);

        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Failed to upload file: " + e.getMessage());
        }
    }

    @Transactional
    @PostMapping("/upload/{requestId}")
    public ResponseEntity<?> uploadDocument(@PathVariable Integer requestId,
                                            @RequestParam("file") MultipartFile file,
                                            HttpServletRequest request,
                                            @RequestParam Integer documentTypeId) {
        try {
            // Получаем токен из заголовка Authorization
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }

            String token = authHeader.substring(7);

            // Проверяем валидность токена
            if (!jwtCore.validateToken(token)) {
                return  ResponseEntity.status(401).body("Invalid token");
            }

            DocumentType documentType = documentTypeRepository.findByTypeId(documentTypeId);

            Integer workerId = jwtCore.getUserIdFromToken(token);

            Worker worker = workerRepository.findById(workerId);

            Student student = requestRepository.findStudentByRequestId(Math.toIntExact(requestId));

            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }
            // Проверка типа файла
            if (!file.getContentType().equals("application/pdf")) {
                return ResponseEntity.badRequest().body("Only PDF documents are allowed");
            }

            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());

            if (originalFilename == null || originalFilename.isEmpty()) {
                return ResponseEntity.badRequest().body("File name is empty");
            }

            if (originalFilename.contains("..")) {
                return ResponseEntity.badRequest().body("Invalid file name");
            }

            // Подготовка пути сохранения
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists() && !uploadDir.mkdirs()) {
                throw new IOException("Failed to create upload directory");
            }

            String uuid = UUID.randomUUID().toString();
            String resultFileName = uuid + "_" + originalFilename;
            File destinationFile = new File(uploadDir, resultFileName);

            // Сохранение файла
            file.transferTo(destinationFile);

            // Создание записи в БД
            Document document = new Document();
            document.setFileName(resultFileName);
            document.setUrlAddress("/api/documents/download/" + resultFileName);
            document.setCreateDate(LocalDateTime.now());
            document.setStudent(student);
            document.setType(documentType);
            document.getWorker().add(worker);

            Document savedDocument = documentRepository.save(document);
            DocumentDto documentDto = new DocumentDto(savedDocument);

            return ResponseEntity.ok(documentDto);

        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Failed to upload file: " + e.getMessage());
        }
    }

    @GetMapping("/download/{filename:.+}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String filename) throws IOException {
        String decodedFilename = URLDecoder.decode(filename, StandardCharsets.UTF_8);
        Path filePath = Paths.get(uploadPath, decodedFilename);

        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }

        byte[] fileContent = Files.readAllBytes(filePath);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + decodedFilename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(fileContent);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getDocuments(@PathVariable Integer studentId) {
        try {
            Student student = studentRepository.findStudentById(studentId);
            if (student == null) {
                return ResponseEntity.notFound().build();
            }

            List<DocumentDto> documents = documentService.getAllDocumentsByStudentId(Long.valueOf(studentId));
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching documents: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{documentId}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long documentId,
                                            HttpServletRequest request) {
        try {
            // Проверка авторизации
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }

            String token = authHeader.substring(7);
            if (!jwtCore.validateToken(token)) {
                return ResponseEntity.status(401).body("Invalid token");
            }

            // Поиск документа
            Optional<Document> documentOptional = documentRepository.findById(documentId);
            if (documentOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Document document = documentOptional.get();

            if (document.getWorker() != null) {
                return ResponseEntity.ok().body("Cant't delete document. Was uploaded by worker");
            }

            // Удаление файла из файловой системы
            Path filePath = Paths.get(uploadPath, document.getFileName());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }

            documentRepository.delete(document);

            return ResponseEntity.ok().body("Document deleted successfully");

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body("Failed to delete document file: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Error deleting document: " + e.getMessage());
        }
    }
}
