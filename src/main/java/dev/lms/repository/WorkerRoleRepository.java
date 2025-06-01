package dev.lms.repository;

import dev.lms.models.Worker;
import dev.lms.models.WorkerRole;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkerRoleRepository extends JpaRepository<WorkerRole, Long> {
    WorkerRole findByName(String name);
}
