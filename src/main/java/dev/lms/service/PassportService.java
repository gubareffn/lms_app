package dev.lms.service;

import dev.lms.dto.GroupDto;
import dev.lms.dto.PassportDto;
import dev.lms.models.Course;
import dev.lms.models.Group;
import dev.lms.models.Passport;
import dev.lms.repository.PassportRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PassportService {
    private final PassportRepository passportRepository;

    public Passport getPassportByStudentId(Integer studentId) {
        return passportRepository.findByStudentId(studentId);
    }


}
