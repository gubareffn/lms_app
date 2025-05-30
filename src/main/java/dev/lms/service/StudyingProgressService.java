package dev.lms.service;

import dev.lms.dto.StudentRegistrationDto;
import dev.lms.dto.StudentWithProgressDto;
import dev.lms.dto.StudyingProgressDto;
import dev.lms.models.Request;
import dev.lms.models.RequestStatus;
import dev.lms.models.StudyingProgress;
import dev.lms.models.StudyingStatus;
import dev.lms.repository.RequestRepository;
import dev.lms.repository.StudyingProgressRepository;
import dev.lms.repository.StudyingStatusRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class StudyingProgressService {
    private final StudyingProgressRepository progressRepository;
    private final RequestRepository requestRepository;
    private final StudyingStatusRepository studyingStatusRepository;

    public StudyingProgressDto getProgress(Integer studentId, Integer courseId) {
        Request request = requestRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new EntityNotFoundException("Request not found"));

        StudyingProgress progress = progressRepository.findByRequest(request)
                .orElseGet(() -> createNewProgress(request));

        return convertToDto(progress);
    }

    private StudyingProgress createNewProgress(Request request) {
        // Получаем статус "В процессе" (id = 1)
        StudyingStatus defaultStatus = studyingStatusRepository.findById(1)
                .orElseThrow(() -> new RuntimeException("Default status not found"));

        StudyingProgress progress = new StudyingProgress();
        progress.setRequest(request);
        progress.setEducationStartDate(LocalDateTime.now());
        progress.setPercent(0);
        progress.setStatus(defaultStatus);
        return progressRepository.save(progress);
    }

    public void updateProgress(Integer studentId, StudyingProgressDto progressDto) {
        Request request = requestRepository.findByStudentIdAndCourseId(studentId, progressDto.getCourseId())
                .orElseThrow(() -> new EntityNotFoundException("Request not found"));

        StudyingProgress progress = progressRepository.findByRequest(request)
                .orElseGet(() -> createNewProgress(request));

        progress.setPercent(progressDto.getPercent());
        if (progressDto.getPercent() == 100) {
            progress.setGraduationDate(LocalDateTime.now());
        }

        progressRepository.save(progress);
    }

    public List<StudentWithProgressDto> getAllStudentsWithProgressByGroup(Integer groupId) {
        return progressRepository.findAllStudentsByGroupId(groupId).stream()
                .map(StudentWithProgressDto::new)
                .collect(Collectors.toList());
    }

    private StudyingProgressDto convertToDto(StudyingProgress progress) {
        StudyingProgressDto dto = new StudyingProgressDto();
        dto.setCourseId(progress.getRequest().getCourse().getId());
        dto.setPercent(progress.getPercent());
        return dto;
    }
}
