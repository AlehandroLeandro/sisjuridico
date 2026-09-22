package sisjuridico.carbocat.repository;



import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;

import sisjuridico.carbocat.entities.Document;


@Repository
public interface DocumentsRepository extends JpaRepository<Document, Long>, JpaSpecificationExecutor<Document> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    java.util.Optional<Document> findLockedById(Long id);

    java.util.List<Document> findTop4ByOrderByCreatedAtDesc();
}
