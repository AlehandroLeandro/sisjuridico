package sisjuridico.carbocat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sisjuridico.carbocat.entities.Lawyer;

@Repository
public interface LawyerRepository extends JpaRepository<Lawyer, Long> {
    
}