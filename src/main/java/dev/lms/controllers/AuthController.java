package dev.lms.controllers;

import dev.lms.dto.StudentRegistrationDto;
import dev.lms.jwt.AuthRequest;
import dev.lms.jwt.AuthResponse;
import dev.lms.models.Worker;
import dev.lms.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/student")
    public ResponseEntity<AuthResponse> register(@RequestBody StudentRegistrationDto dto) {
        return ResponseEntity.ok(authService.registerStudent(dto));
    }

    @PostMapping("/login/student")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.authenticateStudent(request));
    }

//    @PostMapping("/register/worker")
//    public ResponseEntity<AuthResponse> register(@RequestBody Worker worker) {
//        return ResponseEntity.ok(authService.registerWorker(worker));
//    }

    @PostMapping("/login/worker")
    public ResponseEntity<AuthResponse> loginWorker(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.authenticateWorker(request));
    }
}