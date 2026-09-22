package sisjuridico.carbocat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import sisjuridico.carbocat.entities.Lawyer;

import java.util.List;

@Repository
public interface LawyerRepository extends JpaRepository<Lawyer, Long>,
        JpaSpecificationExecutor<Lawyer> {
    List<Lawyer> findByNameContainingIgnoreCase(String name);

    List<Lawyer> findByCpfCnpjContaining(String cpfCnpj);

    List<Lawyer> findByOabContaining(String Oab);
}
