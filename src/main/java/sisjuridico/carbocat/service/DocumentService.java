package sisjuridico.carbocat.service;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sisjuridico.carbocat.dto.request.create.DocumentCreateDTO;
import sisjuridico.carbocat.dto.request.update.DocumentUpdateDTO;
import sisjuridico.carbocat.dto.response.DocumentResponseDTO;
import sisjuridico.carbocat.entities.Contract;
import sisjuridico.carbocat.entities.Document;
import sisjuridico.carbocat.exception.ResourceNotFoundException;
import sisjuridico.carbocat.mapper.DocumentMapper;
import sisjuridico.carbocat.repository.ContractRepository;
import sisjuridico.carbocat.repository.DocumentsRepository;
import sisjuridico.carbocat.specification.DocumentSpecifications;

import java.util.List;

@Service
@Transactional
@AllArgsConstructor
public class DocumentService {
    private final DocumentsRepository documentsRepository;
    private final ContractRepository contractRepository;
    private final DocumentMapper documentMapper;

    @Transactional(readOnly = true)
    public List<DocumentResponseDTO> findByFilters(String fileName, String contentType, Long contractId) {
        return documentMapper.toResponseList(documentsRepository.findAll(
                DocumentSpecifications.withFilters(fileName, contentType, contractId)));
    }

    @Transactional(readOnly = true)
    public DocumentResponseDTO findById(Long id) {
        return documentMapper.toResponse(findEntity(id));
    }

    public DocumentResponseDTO save(DocumentCreateDTO dto) {
        Document document = documentMapper.toEntity(dto);
        document.setContract(findContract(dto.contractId()));
        return documentMapper.toResponse(documentsRepository.save(document));
    }

    public DocumentResponseDTO updateFull(Long id, DocumentCreateDTO dto) {
        Document document = findEntity(id);
        documentMapper.updateEntityFromCreateDto(dto, document);
        document.setContract(findContract(dto.contractId()));
        return documentMapper.toResponse(documentsRepository.save(document));
    }

    public DocumentResponseDTO update(Long id, DocumentUpdateDTO dto) {
        Document document = findEntity(id);
        documentMapper.updateEntityFromDto(dto, document);
        if (dto.contractId() != null) document.setContract(findContract(dto.contractId()));
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
}
