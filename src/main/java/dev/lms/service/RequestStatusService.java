package dev.lms.service;

import dev.lms.models.RequestStatus;
import dev.lms.repository.RequestStatusRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RequestStatusService {
    private final RequestStatusRepository requestStatusRepository;

    public RequestStatusService(RequestStatusRepository requestStatusRepository) {
        this.requestStatusRepository = requestStatusRepository;
    }

    public List<RequestStatus> getAll() {
        return requestStatusRepository.findAll();
    }

}
