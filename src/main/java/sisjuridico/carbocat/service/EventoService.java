package sisjuridico.carbocat.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sisjuridico.carbocat.dto.request.create.EventoCreateDTO;
import sisjuridico.carbocat.dto.request.update.EventoUpdateDTO;
import sisjuridico.carbocat.dto.response.EventoResponseDTO;
import sisjuridico.carbocat.entities.Contract;
import sisjuridico.carbocat.entities.Evento;
import sisjuridico.carbocat.entities.Lawsuit;
import sisjuridico.carbocat.exception.ResourceNotFoundException;
import sisjuridico.carbocat.mapper.EventoMapper;
import sisjuridico.carbocat.repository.ContractRepository;
import sisjuridico.carbocat.repository.EventoRepository;
import sisjuridico.carbocat.repository.LawsuitRepository;
import sisjuridico.carbocat.specification.EventoSpecifications;

import java.time.LocalDate;

@Service
@Transactional
@RequiredArgsConstructor
public class EventoService {
    private final EventoRepository eventoRepository;
    private final ContractRepository contractRepository;
    private final LawsuitRepository lawsuitRepository;
    private final EventoMapper eventoMapper;

    @Transactional(readOnly = true)
    public Page<EventoResponseDTO> findAll(LocalDate from, LocalDate to, Pageable pageable) {
        validateRange(from, to);
        return eventoRepository.findAll(EventoSpecifications.withDateRange(from, to), pageable).map(eventoMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public EventoResponseDTO findById(Long id) {
        return eventoMapper.toResponse(findEntity(id));
    }

    public EventoResponseDTO save(EventoCreateDTO dto) {
        validateOwner(dto.lawsuitId(), dto.contractId());
        Evento evento = eventoMapper.toEntity(dto);
        applyOwner(evento, dto.lawsuitId(), dto.contractId());
        return eventoMapper.toResponse(eventoRepository.save(evento));
    }

    public EventoResponseDTO update(Long id, EventoUpdateDTO dto) {
        Evento evento = findEntity(id);
        eventoMapper.updateEntity(dto, evento);
        if (dto.lawsuitId() != null || dto.contractId() != null) {
            validateOwner(dto.lawsuitId(), dto.contractId());
            applyOwner(evento, dto.lawsuitId(), dto.contractId());
        }
        return eventoMapper.toResponse(eventoRepository.save(evento));
    }

    public void delete(Long id) {
        eventoRepository.delete(findEntity(id));
    }

    private Evento findEntity(Long id) {
        return eventoRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.byId(Evento.class, id));
    }

    private void applyOwner(Evento evento, Long lawsuitId, Long contractId) {
        evento.setLawsuit(lawsuitId == null ? null : lawsuitRepository.findById(lawsuitId)
                .orElseThrow(() -> ResourceNotFoundException.byId(Lawsuit.class, lawsuitId)));
        evento.setContract(contractId == null ? null : contractRepository.findById(contractId)
                .orElseThrow(() -> ResourceNotFoundException.byId(Contract.class, contractId)));
    }

    private void validateOwner(Long lawsuitId, Long contractId) {
        if (lawsuitId != null && contractId != null) {
            throw new IllegalArgumentException("Informe no máximo um vínculo: lawsuitId ou contractId.");
        }
    }

    private void validateRange(LocalDate from, LocalDate to) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new IllegalArgumentException("from não pode ser posterior a to.");
        }
    }
}
