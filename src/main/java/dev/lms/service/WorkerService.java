package dev.lms.service;

import dev.lms.models.Student;
import dev.lms.models.Worker;
import dev.lms.repository.WorkerRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkerService {
    private final WorkerRepository workerRepository;
    private final PasswordEncoder passwordEncoder;

    public WorkerService(WorkerRepository workerRepository) {
        this.workerRepository = workerRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public List<Worker> getAllWorkers() {
        return workerRepository.findAllWithRoles();
    }

    public List<Worker> getAllTeachers() {
        return workerRepository.findAllTeachers();
    }

    public List<Worker> getAllAdmins() {
        return workerRepository.findAllAdmins();
    }
}
