package sisjuridico.carbocat.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import lombok.AllArgsConstructor;
import sisjuridico.carbocat.dto.request.create.LawyerCreateDTO;
import sisjuridico.carbocat.dto.request.update.LawyerUpdateDTO;
import sisjuridico.carbocat.dto.response.LawyerResponseDTO;
import sisjuridico.carbocat.entities.Lawyer;
import sisjuridico.carbocat.exception.ResourceNotFoundException;
import sisjuridico.carbocat.mapper.LawyerMapper;
import sisjuridico.carbocat.repository.LawyerRepository;
import sisjuridico.carbocat.specification.LawyerSpecifications;

@Service
@Transactional
@AllArgsConstructor
public class LawyerService {
    private final LawyerRepository lawyerRepository;
    private final LawyerMapper lawyerMapper;

    @Transactional(readOnly = true)
    public List<LawyerResponseDTO> findAll() {
        return lawyerMapper.toResponseList(lawyerRepository.findAll());
    }

    @Transactional(readOnly = true)
    public Page<LawyerResponseDTO> findByFilters(
            String name,
            String cpfCnpj,
            String oab,
            Pageable pageable
    ) {
        return lawyerRepository.findAll(LawyerSpecifications.withFilters(name, cpfCnpj, oab), pageable)
                .map(lawyerMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public LawyerResponseDTO findById(Long id) {
        Lawyer lawyer = lawyerRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.byId(Lawyer.class, id));
        return lawyerMapper.toResponse(lawyer);
    }

    @Transactional(readOnly = true)
    public List<LawyerResponseDTO> findByName(String name) {
        return lawyerMapper.toResponseList(lawyerRepository.findByNameContainingIgnoreCase(name));
    }

    @Transactional(readOnly = true)
    public List<LawyerResponseDTO> findByCpfCnpjContaining(String cpfCnpj) {
        return lawyerMapper.toResponseList(lawyerRepository.findByCpfCnpjContaining(cpfCnpj));
    }

    @Transactional(readOnly = true)
    public List<LawyerResponseDTO> findByOabContaining(String oab) {
        return lawyerMapper.toResponseList(lawyerRepository.findByOabContaining(oab));
    }

    public LawyerResponseDTO save(LawyerCreateDTO dto) {
        Lawyer savedLawyer = lawyerRepository.save(lawyerMapper.toEntity(dto));
        return lawyerMapper.toResponse(savedLawyer);
    }

    public LawyerResponseDTO updateFull(Long id, LawyerCreateDTO dto) {
        Lawyer lawyer = lawyerRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.byId(Lawyer.class, id));
        lawyerMapper.updateEntityFromCreateDto(dto, lawyer);

        return lawyerMapper.toResponse(lawyerRepository.save(lawyer));
    }

    public LawyerResponseDTO update(Long id, LawyerUpdateDTO dto) {
        Lawyer lawyer = lawyerRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.byId(Lawyer.class, id));
        lawyerMapper.updateEntityFromDto(dto, lawyer);

        return lawyerMapper.toResponse(lawyerRepository.save(lawyer));
    }

    public LawyerResponseDTO delete(Long id) {
        Lawyer lawyer = lawyerRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.byId(Lawyer.class, id));
        LawyerResponseDTO response = lawyerMapper.toResponse(lawyer);
        lawyerRepository.delete(lawyer);

        return response;
    }
}
