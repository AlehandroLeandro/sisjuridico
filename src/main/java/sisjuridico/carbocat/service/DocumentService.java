package sisjuridico.carbocat.service;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sisjuridico.carbocat.dto.request.create.DocumentCreateDTO;
import sisjuridico.carbocat.dto.request.update.DocumentUpdateDTO;
import sisjuridico.carbocat.dto.response.DocumentResponseDTO;
import sisjuridico.carbocat.entities.Contract;
import sisjuridico.carbocat.entities.Document;
import sisjuridico.carbocat.entities.Lawsuit;
import sisjuridico.carbocat.exception.ResourceNotFoundException;
import sisjuridico.carbocat.mapper.DocumentMapper;
import sisjuridico.carbocat.repository.ContractRepository;
import sisjuridico.carbocat.repository.DocumentsRepository;
import sisjuridico.carbocat.repository.LawsuitRepository;
import sisjuridico.carbocat.specification.DocumentSpecifications;

import java.util.List;

@Service
@Transactional
@AllArgsConstructor
public class DocumentService {
    private final DocumentsRepository documentsRepository;
    private final ContractRepository contractRepository;
    private final LawsuitRepository lawsuitRepository;
    private final DocumentMapper documentMapper;

    @Transactional(readOnly = true)
    public List<DocumentResponseDTO> findByFilters(String fileName, String contentType, Long contractId, Long lawsuitId) {
        return documentMapper.toResponseList(documentsRepository.findAll(
                DocumentSpecifications.withFilters(fileName, contentType, contractId, lawsuitId)));
    }

    @Transactional(readOnly = true)
    public DocumentResponseDTO findById(Long id) {
        return documentMapper.toResponse(findEntity(id));
    }

    public DocumentResponseDTO save(DocumentCreateDTO dto) {
        Document document = documentMapper.toEntity(dto);
        applyOwner(document, dto.contractId(), dto.lawsuitId());
        return documentMapper.toResponse(documentsRepository.save(document));
    }

    public DocumentResponseDTO updateFull(Long id, DocumentCreateDTO dto) {
        Document document = findEntity(id);
        documentMapper.updateEntityFromCreateDto(dto, document);
        applyOwner(document, dto.contractId(), dto.lawsuitId());
        return documentMapper.toResponse(documentsRepository.save(document));
    }

    public DocumentResponseDTO update(Long id, DocumentUpdateDTO dto) {
        Document document = findEntity(id);
        documentMapper.updateEntityFromDto(dto, document);
        if (dto.contractId() != null || dto.lawsuitId() != null) {
            applyOwner(document, dto.contractId(), dto.lawsuitId());
        }
        return documentMapper.toResponse(documentsRepository.save(document));
    }

    public DocumentResponseDTO delete(Long id) {
        Document document = findEntity(id);
        DocumentResponseDTO response = documentMapper.toResponse(document);
        documentsRepository.delete(document);
        return response;
    }

    private Document findEntity(Long id) {
        return documentsRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.byId(Document.class, id));
    }

    private Contract findContract(Long id) {
        return contractRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.byId(Contract.class, id));
    }

    private Lawsuit findLawsuit(Long id) {
        return lawsuitRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.byId(Lawsuit.class, id));
    }

    private void applyOwner(Document document, Long contractId, Long lawsuitId) {
        validateOwner(contractId, lawsuitId);
        document.setContract(contractId == null ? null : findContract(contractId));
        document.setLawsuit(lawsuitId == null ? null : findLawsuit(lawsuitId));
    }

    private void validateOwner(Long contractId, Long lawsuitId) {
        if ((contractId == null && lawsuitId == null) || (contractId != null && lawsuitId != null)) {
            throw new IllegalArgumentException("Informe contractId ou lawsuitId, mas não ambos.");
        }
    }
}
