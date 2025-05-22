package dev.lms.service;

import dev.lms.models.Student;
import dev.lms.models.Worker;
import dev.lms.models.WorkerRole;
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

    private Worker createWorker(String email, String password, String firstName,
                                String lastName, WorkerRole role) {
        Worker worker = new Worker();
        worker.setEmail(email);
        worker.setPassword(passwordEncoder.encode(password));
        worker.setFirstName(firstName);
        worker.setLastName(lastName);
        worker.setRole(role);

        return workerRepository.save(worker);
    }
}
