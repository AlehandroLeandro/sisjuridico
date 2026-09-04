package sisjuridico.carbocat.repository;



import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sisjuridico.carbocat.entities.Documents;


@Repository
public interface DocumentsRepository extends JpaRepository<Documents, Long> {
    
    
}