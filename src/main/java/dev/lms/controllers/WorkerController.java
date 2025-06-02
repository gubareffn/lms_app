package dev.lms.controllers;

import dev.lms.dto.WorkerListDto;
import dev.lms.models.Student;
import dev.lms.models.Worker;
import dev.lms.models.WorkerRole;
import dev.lms.repository.WorkerRepository;
import dev.lms.repository.WorkerRoleRepository;
import dev.lms.service.StudentService;
import dev.lms.service.WorkerService;
import io.jsonwebtoken.security.Password;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workers")
@RequiredArgsConstructor
public class WorkerController {
    private final WorkerService workerService;
    private final WorkerRepository workerRepository;
    private final WorkerRoleRepository workerRoleRepository;
    private final PasswordEncoder passwordEncoder;


    @GetMapping
    public List<WorkerListDto> getWorkers() {
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

    // Добавление работника
    @Transactional
    @PostMapping("/create")
    public ResponseEntity<?> updateWorker(@RequestBody Map<String, String> requestBody) {
        Worker findWorker = workerRepository.findByEmail(requestBody.get("email")).orElse(null);
        if (findWorker != null) {
            return ResponseEntity.status(404).body("Worker already exists");
        }

        Worker createWorker = new Worker();

        String roleName = requestBody.get("role");
        WorkerRole role = workerRoleRepository.findByName(roleName);

        createWorker.setFirstName(requestBody.get("firstName"));
        createWorker.setLastName(requestBody.get("lastName"));
        createWorker.setMiddleName(requestBody.get("middleName"));
        createWorker.setEmail(requestBody.get("email"));
        createWorker.setPassword(passwordEncoder.encode(requestBody.get("password")));
        createWorker.setRole(role);
        workerService.saveWorker(createWorker);
        return ResponseEntity.ok(createWorker);
    }

    // Обновление работника
    @Transactional
    @PutMapping("/{workerId}/update")
    public ResponseEntity<?> updateWorker(@PathVariable Long workerId,
                                           @RequestBody Map<String, String> requestBody) {
        Worker updateWorker = workerRepository.findById(workerId).orElse(null);
        if (updateWorker == null) {
            return ResponseEntity.status(404).body("Student not found");
        }

        String roleName = requestBody.get("role");
        WorkerRole role = workerRoleRepository.findByName(roleName);

        updateWorker.setFirstName(requestBody.get("firstName"));
        updateWorker.setLastName(requestBody.get("lastName"));
        updateWorker.setMiddleName(requestBody.get("middleName"));
        updateWorker.setEmail(requestBody.get("email"));
        updateWorker.setPassword(passwordEncoder.encode(requestBody.get("password")));
        updateWorker.setRole(role);
        workerService.saveWorker(updateWorker);
        return ResponseEntity.ok(updateWorker);
    }

    @DeleteMapping("/{workerId}/delete")
    public ResponseEntity<?> deleteWorker(@PathVariable Long workerId){
        workerService.deleteWorker(workerId);
        return  ResponseEntity.ok("Worker deleted");
    }

}
