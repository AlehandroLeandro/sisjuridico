package sisjuridico.carbocat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sisjuridico.carbocat.entities.ContractExtension;

@Repository
public interface ContractExtensionRepository extends JpaRepository<ContractExtension, Long> {
    List<ContractExtension> findByContractIdOrderByExtendedAtDescIdDesc(Long contractId);
}
