package sisjuridico.carbocat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import sisjuridico.carbocat.entities.Lawsuit;

@Repository
public interface LawsuitRepository extends JpaRepository<Lawsuit, Long>, JpaSpecificationExecutor<Lawsuit> {
    
}
