package sisjuridico.carbocat.service;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sisjuridico.carbocat.dto.request.create.LawsuitCreateDTO;
import sisjuridico.carbocat.dto.request.update.LawsuitUpdateDTO;
import sisjuridico.carbocat.dto.response.LawsuitResponseDTO;
import sisjuridico.carbocat.entities.Lawyer;
import sisjuridico.carbocat.entities.Lawsuit;
import sisjuridico.carbocat.entities.Person;
import sisjuridico.carbocat.enums.Action;
import sisjuridico.carbocat.enums.Court;
import sisjuridico.carbocat.enums.InitialOrganization;
import sisjuridico.carbocat.enums.Nature;
import sisjuridico.carbocat.enums.PositionClient;
import sisjuridico.carbocat.enums.Rit;
import sisjuridico.carbocat.exception.ResourceNotFoundException;
import sisjuridico.carbocat.mapper.LawsuitMapper;
import sisjuridico.carbocat.repository.LawyerRepository;
import sisjuridico.carbocat.repository.LawsuitRepository;
import sisjuridico.carbocat.repository.PersonRepository;
import sisjuridico.carbocat.specification.LawsuitSpecifications;

import java.util.List;

@Service
@Transactional
@AllArgsConstructor
public class LawsuitService {
    private final LawsuitRepository lawsuitRepository;
    private final PersonRepository personRepository;
    private final LawyerRepository lawyerRepository;
    private final LawsuitMapper lawsuitMapper;

    @Transactional(readOnly = true)
    public List<LawsuitResponseDTO> findByFilters(Long numProcesso, Long personId, Long lawyerId,
                                                   Long counterPartPersonId, Long counterPartLawyerId, Rit rit,
                                                   Court court, InitialOrganization initialOrganization,
                                                   PositionClient positionClient, Nature nature, Action action) {
        return lawsuitMapper.toResponseList(lawsuitRepository.findAll(
                LawsuitSpecifications.withFilters(numProcesso, personId, lawyerId, counterPartPersonId,
                        counterPartLawyerId, rit, court, initialOrganization, positionClient, nature, action)));
    }

    @Transactional(readOnly = true)
    public LawsuitResponseDTO findById(Long id) {
        return lawsuitMapper.toResponse(findEntity(id));
    }

    public LawsuitResponseDTO save(LawsuitCreateDTO dto) {
        Lawsuit lawsuit = lawsuitMapper.toEntity(dto);
        applyRelationships(lawsuit, dto.personId(), dto.lawyerId(), dto.counterPartPersonId(), dto.counterPartLawyerId());
        return lawsuitMapper.toResponse(lawsuitRepository.save(lawsuit));
    }

    public LawsuitResponseDTO updateFull(Long id, LawsuitCreateDTO dto) {
        Lawsuit lawsuit = findEntity(id);
        lawsuitMapper.updateEntityFromCreateDto(dto, lawsuit);
        applyRelationships(lawsuit, dto.personId(), dto.lawyerId(), dto.counterPartPersonId(), dto.counterPartLawyerId());
        return lawsuitMapper.toResponse(lawsuitRepository.save(lawsuit));
    }

    public LawsuitResponseDTO update(Long id, LawsuitUpdateDTO dto) {
        Lawsuit lawsuit = findEntity(id);
        lawsuitMapper.updateEntityFromDto(dto, lawsuit);
        if (dto.personId() != null) lawsuit.setPerson(findPerson(dto.personId()));
        if (dto.lawyerId() != null) lawsuit.setLawyer(findLawyer(dto.lawyerId()));
        if (dto.counterPartPersonId() != null) lawsuit.setCounterPartPerson(findPerson(dto.counterPartPersonId()));
        if (dto.counterPartLawyerId() != null) lawsuit.setCounterPartLawyer(findLawyer(dto.counterPartLawyerId()));
        return lawsuitMapper.toResponse(lawsuitRepository.save(lawsuit));
    }

    public LawsuitResponseDTO delete(Long id) {
        Lawsuit lawsuit = findEntity(id);
        LawsuitResponseDTO response = lawsuitMapper.toResponse(lawsuit);
        lawsuitRepository.delete(lawsuit);
        return response;
    }

    private Lawsuit findEntity(Long id) {
        return lawsuitRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.byId(Lawsuit.class, id));
    }

    private Person findPerson(Long id) {
        return personRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.byId(Person.class, id));
    }

    private Lawyer findLawyer(Long id) {
        return lawyerRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.byId(Lawyer.class, id));
    }

    private void applyRelationships(Lawsuit lawsuit, Long personId, Long lawyerId,
                                    Long counterPartPersonId, Long counterPartLawyerId) {
        lawsuit.setPerson(findPerson(personId));
        lawsuit.setLawyer(findLawyer(lawyerId));
        lawsuit.setCounterPartPerson(findPerson(counterPartPersonId));
        lawsuit.setCounterPartLawyer(findLawyer(counterPartLawyerId));
    }
}
