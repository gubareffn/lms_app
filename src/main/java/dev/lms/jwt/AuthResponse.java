package dev.lms.jwt;

public record AuthResponse(String token, Integer studentId, String email, String userType, String role) {

}
