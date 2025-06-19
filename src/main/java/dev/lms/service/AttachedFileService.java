package dev.lms.service;

import dev.lms.dto.AttachedFileDto;
import dev.lms.dto.DocumentDto;
import dev.lms.repository.AttachedFileRepository;
import dev.lms.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttachedFileService {

    private final AttachedFileRepository attachedFileRepository;

    public List<AttachedFileDto> getAllByAssignmentId(Long studentId) {
        return attachedFileRepository.findAllByAssignmentId(studentId).stream()
                .map(AttachedFileDto::new)
                .collect(Collectors.toList());
    }
}
