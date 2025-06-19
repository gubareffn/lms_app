package dev.lms.controllers;

import dev.lms.dto.AttachedFileDto;
import dev.lms.dto.DocumentDto;
import dev.lms.models.Assignment;
import dev.lms.models.AttachedFile;
import dev.lms.models.Document;
import dev.lms.models.Student;
import dev.lms.repository.AssignmentRepository;
import dev.lms.repository.AttachedFileRepository;
import dev.lms.repository.DocumentRepository;
import dev.lms.service.AttachedFileService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class AtachedFileController {
    private final AttachedFileRepository attachedFileRepository;
    private final AssignmentRepository assignmentRepository;
    private final AttachedFileService attachedFileService;

    @Value("${upload.path}")
    private String uploadPath;

    @Transactional
    @PostMapping("/upload/task/{taskId}")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file, @PathVariable Integer taskId) {
        try {
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
                return ResponseEntity.badRequest().body("Failed to create upload directory");
            }

            String uuid = UUID.randomUUID().toString();
            String resultFileName = uuid + "_" + originalFilename;
            File destinationFile = new File(uploadDir, resultFileName);

            // Сохранение файла
            file.transferTo(destinationFile);

            // Создание записи в БД
            AttachedFile newfile = new AttachedFile();
            newfile.setFileName(resultFileName);
            newfile.setUrlAddress("/api/files/download/" + resultFileName);
            Optional<Assignment> assignment = assignmentRepository.findById(taskId);
            assignment.ifPresent(newfile::setAssignment);
            AttachedFile savedFile = attachedFileRepository.save(newfile);
            AttachedFileDto fileDto = new AttachedFileDto(savedFile);

            return ResponseEntity.ok(fileDto);
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

    @GetMapping("/assignment/{taskId}")
    public ResponseEntity<?> getFilesByAssignmentId(@PathVariable Integer taskId) {
        try {
            Optional<Assignment> assignment = assignmentRepository.findById(taskId);
            if (assignment.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            List<AttachedFileDto> files = attachedFileService.getAllByAssignmentId(Long.valueOf(taskId));
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching documents: " + e.getMessage());
        }
    }
}
