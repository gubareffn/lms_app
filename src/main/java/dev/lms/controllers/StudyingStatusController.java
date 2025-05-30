package dev.lms.controllers;

import dev.lms.models.RequestStatus;
import dev.lms.models.StudyingStatus;
import dev.lms.service.RequestStatusService;
import dev.lms.service.StudyingStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/progress/status")
@RequiredArgsConstructor
public class StudyingStatusController {
    private final StudyingStatusService studyingStatusService;

    @GetMapping
    public List<StudyingStatus> getAllStudtingStatus() {
        return studyingStatusService.getAll();
    }
}
