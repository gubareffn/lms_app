package dev.lms.service;

import dev.lms.dto.StudentListDto;
import dev.lms.dto.WorkerListDto;
import dev.lms.models.Student;
import dev.lms.models.Worker;
import dev.lms.models.WorkerRole;
import dev.lms.repository.WorkerRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkerService {
    private final WorkerRepository workerRepository;
    private final PasswordEncoder passwordEncoder;

    public WorkerService(WorkerRepository workerRepository) {
        this.workerRepository = workerRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public List<WorkerListDto> getAllWorkers() {
        return workerRepository.findAllWithRoles().stream()
                .map(WorkerListDto::new)
                .collect(Collectors.toList());
    }

    public List<Worker> getAllTeachers() {
        return workerRepository.findAllTeachers();
    }

    public List<Worker> getAllAdmins() {
        return workerRepository.findAllAdmins();
    }

    public void saveWorker(Worker worker) {
        workerRepository.save(worker);
    }

    public void deleteWorker(Long workerId) {
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found with id: " + workerId));

        workerRepository.deleteById(workerId);
    }
}
