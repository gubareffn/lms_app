package dev.lms.repository;

import dev.lms.models.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DocumentTypeRepository extends JpaRepository<DocumentType, Integer> {

    @Query("SELECT d FROM DocumentType d WHERE d.id = :typeId")
    DocumentType findByTypeId(@Param("typeId")Integer typeId);
}
