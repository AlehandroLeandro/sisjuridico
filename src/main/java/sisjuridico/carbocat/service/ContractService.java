package sisjuridico.carbocat.service;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sisjuridico.carbocat.dto.request.create.ContractExtensionCreateDTO;
import sisjuridico.carbocat.dto.request.create.ContractCreateDTO;
import sisjuridico.carbocat.dto.request.update.ContractUpdateDTO;
import sisjuridico.carbocat.dto.response.ContractExtensionResponseDTO;
import sisjuridico.carbocat.dto.response.ContractResponseDTO;
import sisjuridico.carbocat.entities.Contract;
import sisjuridico.carbocat.entities.ContractExtension;
import sisjuridico.carbocat.entities.Person;
import sisjuridico.carbocat.enums.TypeContract;
import sisjuridico.carbocat.mapper.ContractExtensionMapper;
import sisjuridico.carbocat.exception.ResourceNotFoundException;
import sisjuridico.carbocat.mapper.ContractMapper;
import sisjuridico.carbocat.repository.ContractExtensionRepository;
import sisjuridico.carbocat.repository.ContractRepository;
import sisjuridico.carbocat.repository.PersonRepository;
import sisjuridico.carbocat.specification.ContractSpecifications;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
@AllArgsConstructor
public class ContractService {
    private final ContractRepository contractRepository;
    private final ContractExtensionRepository contractExtensionRepository;
    private final PersonRepository personRepository;
    private final ContractMapper contractMapper;
    private final ContractExtensionMapper contractExtensionMapper;

    @Transactional(readOnly = true)
    public List<ContractResponseDTO> findByFilters(Boolean active, TypeContract typeContract, Long contractorId, Long contractedId) {
        return contractMapper.toResponseList(contractRepository.findAll(
                ContractSpecifications.withFilters(active, typeContract, contractorId, contractedId)));
    }

    @Transactional(readOnly = true)
    public ContractResponseDTO findById(Long id) {
        return contractMapper.toResponse(findEntity(id));
    }

    public ContractResponseDTO save(ContractCreateDTO dto) {
        Contract contract = contractMapper.toEntity(dto);
        applyRelationships(contract, dto.contractorId(), dto.contractedId());
        contract.setOriginalEndDate(dto.endDate());
        deactivateIfExpired(contract, LocalDate.now());
        return contractMapper.toResponse(contractRepository.save(contract));
    }

    public ContractResponseDTO updateFull(Long id, ContractCreateDTO dto) {
        Contract contract = findEntity(id);
        contractMapper.updateEntityFromCreateDto(dto, contract);
        applyRelationships(contract, dto.contractorId(), dto.contractedId());
        ensureOriginalEndDate(contract);
        deactivateIfExpired(contract, LocalDate.now());
        return contractMapper.toResponse(contractRepository.save(contract));
    }

    public ContractResponseDTO update(Long id, ContractUpdateDTO dto) {
        Contract contract = findEntity(id);
        contractMapper.updateEntityFromDto(dto, contract);
        if (dto.contractorId() != null) contract.setContractor(findPerson(dto.contractorId()));
        if (dto.contractedId() != null) contract.setContracted(findPerson(dto.contractedId()));
        ensureOriginalEndDate(contract);
        deactivateIfExpired(contract, LocalDate.now());
        return contractMapper.toResponse(contractRepository.save(contract));
    }

    @Transactional(readOnly = true)
    public List<ContractExtensionResponseDTO> findExtensions(Long contractId) {
        findEntity(contractId);
        return contractExtensionMapper.toResponseList(
                contractExtensionRepository.findByContractIdOrderByExtendedAtDescIdDesc(contractId));
    }

    public ContractExtensionResponseDTO extend(Long contractId, ContractExtensionCreateDTO dto) {
        Contract contract = findEntity(contractId);
        LocalDate today = LocalDate.now();
        LocalDate previousEndDate = contract.getEndDate();

        if (previousEndDate == null) {
            throw new IllegalArgumentException("Contratos com data final indefinida não podem ser prorrogados.");
        }
        if (!dto.newEndDate().isAfter(previousEndDate)) {
            throw new IllegalArgumentException("A nova data final deve ser posterior à data final atual do contrato.");
        }
        if (dto.newEndDate().isBefore(today)) {
            throw new IllegalArgumentException("A nova data final não pode estar no passado.");
        }

        ensureOriginalEndDate(contract);

        ContractExtension extension = new ContractExtension();
        extension.setContract(contract);
        extension.setPreviousEndDate(previousEndDate);
        extension.setNewEndDate(dto.newEndDate());
        extension.setExtendedAt(today);
        extension.setObs(dto.obs());

        contract.setEndDate(dto.newEndDate());
        contract.setActive(true);
        contractRepository.save(contract);
        return contractExtensionMapper.toResponse(contractExtensionRepository.save(extension));
    }

    public int deactivateExpiredContracts(LocalDate today) {
        return contractRepository.deactivateExpiredContracts(today);
    }

    public ContractResponseDTO delete(Long id) {
        Contract contract = findEntity(id);
        ContractResponseDTO response = contractMapper.toResponse(contract);
        contractRepository.delete(contract);
        return response;
    }

    private Contract findEntity(Long id) {
        return contractRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.byId(Contract.class, id));
    }

    private Person findPerson(Long id) {
        return personRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.byId(Person.class, id));
    }

    private void applyRelationships(Contract contract, Long contractorId, Long contractedId) {
        contract.setContractor(findPerson(contractorId));
        contract.setContracted(findPerson(contractedId));
    }

    private void ensureOriginalEndDate(Contract contract) {
        if (contract.getOriginalEndDate() == null) {
            contract.setOriginalEndDate(contract.getEndDate());
        }
    }

    private void deactivateIfExpired(Contract contract, LocalDate today) {
        if (contract.getEndDate() != null && contract.getEndDate().isBefore(today)) {
            contract.setActive(false);
        }
    }
}
