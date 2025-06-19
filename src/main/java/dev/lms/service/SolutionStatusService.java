package dev.lms.service;

import dev.lms.models.SolutionStatus;
import dev.lms.repository.RequestStatusRepository;
import dev.lms.repository.SolutionRepository;
import dev.lms.repository.SolutionStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
public class SolutionStatusService {
    private final SolutionStatusRepository solutionStatusRepository;

    public SolutionStatusService(SolutionStatusRepository solutionStatusRepository) {
        this.solutionStatusRepository = solutionStatusRepository;
    }
}
