package sisjuridico.carbocat.repository;



import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sisjuridico.carbocat.entities.Document;


@Repository
public interface DocumentsRepository extends JpaRepository<Document, Long> {
    
    
}