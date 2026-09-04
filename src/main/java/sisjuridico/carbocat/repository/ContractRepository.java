package sisjuridico.carbocat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sisjuridico.carbocat.entities.Contract;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {
    
}