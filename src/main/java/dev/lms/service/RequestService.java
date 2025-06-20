package dev.lms.service;


import dev.lms.dto.*;
import dev.lms.models.Course;
import dev.lms.models.Request;
import dev.lms.models.RequestStatus;
import dev.lms.models.Student;
import dev.lms.repository.CourseRepository;
import dev.lms.repository.RequestStatusRepository;
import dev.lms.repository.RequestRepository;
import dev.lms.repository.StudentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RequestService {
    private final RequestRepository requestRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final RequestStatusRepository requestStatusRepository;

    @Transactional
    public RequestDto createRequest(CreateRequestDTO dto, Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        Course course = courseRepository.findById(Long.valueOf(dto.getCourseId()))
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + dto.getCourseId()));


        if (requestRepository.existsByStudentIdAndCourseId(studentId, dto.getCourseId())) {
            throw new RuntimeException("Request already exists for this course");
        }

        // Получаем статус "В рассмотрении" (id = 1)
        RequestStatus defaultStatus = requestStatusRepository.findById(1)
                .orElseThrow(() -> new RuntimeException("Default status not found"));

        // Создаем новую заявку
        Request request = new Request();
        request.setStudent(student);
        request.setCourse(course);
        request.setStatus(defaultStatus); // Устанавливаем статус
        request.setCreateTime(LocalDateTime.now()); // Устанавливаем текущую дату создания

        // Сохраняем заявку в базу
        Request savedRequest = requestRepository.save(request);

        // Преобразуем сохраненную заявку в DTO и возвращаем
        return new RequestDto(savedRequest);
    }

    // Вспомогательный метод для преобразования Request в RequestDTO
    private RequestDTOBuilder convertToDTO(Request request) {
        return RequestDTOBuilder.builder()
                .id(request.getId())
                .studentId(request.getStudent().getId())
                .courseId(request.getCourse().getId())
                .statusId(request.getStatus().getId())
                .status(request.getStatus().getName())
                .createTime(request.getCreateTime())
                .processingTime(request.getProcessingTime())
                .requestText(request.getRequestText())
                .courseName(request.getCourse().getName())
                .studentFirstName(request.getStudent().getFirstName())
                .studentLastName(request.getStudent().getLastName())
                .studentMiddleName(request.getStudent().getMiddleName())
                .build();
    }

    public List<RequestDTOBuilder> getAllRequests() {
        return requestRepository.findAllWithRelations().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<RequestDTOBuilder> getRequestsByStudent(Integer studentId) {
        return requestRepository.findAllRequestsByStudentId(studentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CourseShortDto> getCoursesByStudent(Integer studentId) {
        return requestRepository.findAllCoursesByStudentId(studentId).stream()
                .map(CourseShortDto::new)
                .collect(Collectors.toList());
    }

    public List<StudentRegistrationDto> getAllStudentsByGroup(Integer groupId) {
        return requestRepository.findAllStudentsByGroupId(groupId).stream()
                .map(StudentRegistrationDto::new)
                .collect(Collectors.toList());
    }

    public void deleteRequest(Integer requestId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with id: " + requestId));

        requestRepository.deleteById(requestId);
    }
}
