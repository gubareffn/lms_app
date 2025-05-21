package dev.lms.repository;

import dev.lms.models.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RequestStatusRepository extends JpaRepository<RequestStatus, Integer> {

}
