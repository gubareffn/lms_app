package dev.lms.controllers;

import dev.lms.models.CourseStatus;
import dev.lms.models.RequestStatus;
import dev.lms.service.CourseStatusService;
import dev.lms.service.RequestStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/request/status")
public class RequestStatusController {
    private final RequestStatusService requestStatusService;

    public RequestStatusController(RequestStatusService requestStatusService) {
        this.requestStatusService = requestStatusService;
    }

    @GetMapping
    public List<RequestStatus> getAllRequestStatus() {
        return requestStatusService.getAll();
    }
}
