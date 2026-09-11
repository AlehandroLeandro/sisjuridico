package sisjuridico.carbocat.service;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sisjuridico.carbocat.dto.request.create.ContractCreateDTO;
import sisjuridico.carbocat.dto.request.update.ContractUpdateDTO;
import sisjuridico.carbocat.dto.response.ContractResponseDTO;
import sisjuridico.carbocat.entities.Contract;
import sisjuridico.carbocat.entities.Person;
import sisjuridico.carbocat.enums.TypeContract;
import sisjuridico.carbocat.exception.ResourceNotFoundException;
import sisjuridico.carbocat.mapper.ContractMapper;
import sisjuridico.carbocat.repository.ContractRepository;
import sisjuridico.carbocat.repository.PersonRepository;
import sisjuridico.carbocat.specification.ContractSpecifications;

import java.util.List;

@Service
@Transactional
@AllArgsConstructor
public class ContractService {
    private final ContractRepository contractRepository;
    private final PersonRepository personRepository;
    private final ContractMapper contractMapper;

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
        return contractMapper.toResponse(contractRepository.save(contract));
    }

    public ContractResponseDTO updateFull(Long id, ContractCreateDTO dto) {
        Contract contract = findEntity(id);
        contractMapper.updateEntityFromCreateDto(dto, contract);
        applyRelationships(contract, dto.contractorId(), dto.contractedId());
        return contractMapper.toResponse(contractRepository.save(contract));
    }

    public ContractResponseDTO update(Long id, ContractUpdateDTO dto) {
        Contract contract = findEntity(id);
        contractMapper.updateEntityFromDto(dto, contract);
        if (dto.contractorId() != null) contract.setContractor(findPerson(dto.contractorId()));
        if (dto.contractedId() != null) contract.setContracted(findPerson(dto.contractedId()));
        return contractMapper.toResponse(contractRepository.save(contract));
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
}
