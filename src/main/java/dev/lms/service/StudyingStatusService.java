package dev.lms.service;

import dev.lms.models.RequestStatus;
import dev.lms.models.StudyingStatus;
import dev.lms.repository.RequestStatusRepository;
import dev.lms.repository.StudyingStatusRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudyingStatusService {
    private final StudyingStatusRepository studyingStatusRepository;

    public StudyingStatusService(StudyingStatusRepository studyingStatusRepository) {
        this.studyingStatusRepository = studyingStatusRepository;
    }

    public List<StudyingStatus> getAll() {
        return studyingStatusRepository.findAll();
    }
}
