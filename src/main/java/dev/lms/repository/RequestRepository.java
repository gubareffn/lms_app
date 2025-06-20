package dev.lms.repository;

import dev.lms.models.Course;
import dev.lms.models.Request;
import dev.lms.models.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RequestRepository extends JpaRepository<Request, Integer> {
    List<Request> findByStudentId(Integer studentId);

    List<Request> findByCourseId(Integer courseId);

    Optional<Request> findByStudentIdAndCourseId(Integer studentId, Integer courseId);

    @Query("SELECT r FROM Request r JOIN FETCH r.status JOIN FETCH r.course WHERE r.student.id = :studentId")
    List<Request> findAllRequestsByStudentId(@Param("studentId") Integer id);

    //Получение списка курсов авторизованного студента
    @Query("SELECT r.course FROM Request r WHERE r.status.name like 'Одобрена' AND r.student.id = :id")
    List <Course> findAllCoursesByStudentId(@Param("id") Integer id);

    @Query("SELECT r FROM Request r JOIN FETCH r.status JOIN FETCH r.course")
    List<Request> findAllWithRelations();

    @Query("SELECT r.student FROM Request r WHERE r.group.id = :groupId")
    List<Student> findAllStudentsByGroupId(@Param("groupId") Integer groupId);

    @Query("SELECT r.student FROM Request r WHERE r.id = :requestId")
    Student findStudentByRequestId(@Param("requestId") Integer requestId);

    Optional <Request> findRequestByStudentId(Integer studentId);


    boolean existsByStudentIdAndCourseId(Long studentId, Integer courseId);
}
