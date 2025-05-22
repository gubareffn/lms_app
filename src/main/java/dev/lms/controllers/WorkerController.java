package dev.lms.controllers;

import dev.lms.models.Student;
import dev.lms.models.Worker;
import dev.lms.service.WorkerService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/workers")
public class WorkerController {
    private final WorkerService workerService;

    public WorkerController(WorkerService workerService) {
        this.workerService = workerService;
    }

    @GetMapping
    public List<Worker> getWorkers() {
        return workerService.getAllWorkers();
    }

    @GetMapping("/teachers")
    public List<Worker> getTeachers() {
        return workerService.getAllTeachers();
    }

    @GetMapping("/admins")
    public List<Worker> getAdmins() {
        return workerService.getAllAdmins();
    }

}
