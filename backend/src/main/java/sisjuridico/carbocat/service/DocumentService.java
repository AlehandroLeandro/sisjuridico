package sisjuridico.carbocat.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartFile;
import sisjuridico.carbocat.dto.request.update.DocumentUpdateDTO;
import sisjuridico.carbocat.dto.response.DocumentDownloadResponseDTO;
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

import java.time.Instant;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class DocumentService {
    private static final Logger log = LoggerFactory.getLogger(DocumentService.class);
    private static final long MAX_FILE_SIZE = 20L * 1024 * 1024;

    private final DocumentsRepository documentsRepository;
    private final ContractRepository contractRepository;
    private final LawsuitRepository lawsuitRepository;
    private final DocumentMapper documentMapper;
    private final ObjectStorageService objectStorageService;

    @Transactional(readOnly = true)
    public Page<DocumentResponseDTO> findByFilters(String fileName, String contentType, Long contractId, Long lawsuitId,
                                                     Pageable pageable) {
        return documentsRepository.findAll(DocumentSpecifications.withFilters(fileName, contentType, contractId, lawsuitId), pageable)
                .map(documentMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public DocumentResponseDTO findById(Long id) {
        return documentMapper.toResponse(findEntity(id));
    }

    public DocumentResponseDTO upload(MultipartFile file, String fileName, Long contractId, Long lawsuitId) {
        validateFile(file);
        validateOwner(contractId, lawsuitId);
        Contract contract = contractId == null ? null : findContract(contractId);
        Lawsuit lawsuit = lawsuitId == null ? null : findLawsuit(lawsuitId);
        String objectKey = UUID.randomUUID().toString();
        String resolvedName = fileName == null || fileName.isBlank() ? requiredOriginalFileName(file) : fileName;
        String contentType = file.getContentType() == null ? "application/octet-stream" : file.getContentType();

        objectStorageService.upload(objectKey, file, contentType);
        try {
            Document document = new Document();
            document.setFileName(resolvedName);
            document.setContentType(contentType);
            document.setStoragePath(objectKey);
            document.setSizeBytes(file.getSize());
            document.setContract(contract);
            document.setLawsuit(lawsuit);
            return documentMapper.toResponse(documentsRepository.save(document));
        } catch (RuntimeException exception) {
            deleteAfterFailedSave(objectKey);
            throw exception;
        }
    }

    @Transactional(readOnly = true)
    public DocumentDownloadResponseDTO download(Long id) {
        Document document = findEntity(id);
        Instant expiresAt = Instant.now().plusSeconds(300);
        return new DocumentDownloadResponseDTO(objectStorageService.downloadUrl(document.getStoragePath()), expiresAt);
    }

    public DocumentResponseDTO replaceFile(Long id, MultipartFile file) {
        validateFile(file);
        Document document = findLockedEntity(id);
        String oldObjectKey = document.getStoragePath();
        String newObjectKey = UUID.randomUUID().toString();
        String contentType = file.getContentType() == null ? "application/octet-stream" : file.getContentType();

        objectStorageService.upload(newObjectKey, file, contentType);
        try {
            document.setStoragePath(newObjectKey);
            document.setFileName(requiredOriginalFileName(file));
            document.setContentType(contentType);
            document.setSizeBytes(file.getSize());
            DocumentResponseDTO response = documentMapper.toResponse(documentsRepository.save(document));
            deleteReplacedObject(oldObjectKey, id);
            return response;
        } catch (RuntimeException exception) {
            deleteAfterFailedSave(newObjectKey);
            throw exception;
        }
    }

    public DocumentResponseDTO update(Long id, DocumentUpdateDTO dto) {
        Document document = findEntity(id);
        documentMapper.updateEntityFromDto(dto, document);
        if (dto.contractId() != null || dto.lawsuitId() != null) {
            applyOwner(document, dto.contractId(), dto.lawsuitId());
        }
        return documentMapper.toResponse(documentsRepository.save(document));
    }

    public void delete(Long id) {
        Document document = findEntity(id);
        objectStorageService.delete(document.getStoragePath());
        documentsRepository.delete(document);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Arquivo é obrigatório.");
        if (file.getSize() > MAX_FILE_SIZE) throw new MaxUploadSizeExceededException(MAX_FILE_SIZE);
    }

    private String requiredOriginalFileName(MultipartFile file) {
        String name = file.getOriginalFilename();
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Arquivo deve possuir nome.");
        return name;
    }

    private Document findEntity(Long id) {
        return documentsRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.byId(Document.class, id));
    }

    private Document findLockedEntity(Long id) {
        return documentsRepository.findLockedById(id).orElseThrow(() -> ResourceNotFoundException.byId(Document.class, id));
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

    private void deleteAfterFailedSave(String objectKey) {
        try {
            objectStorageService.delete(objectKey);
        } catch (RuntimeException cleanupFailure) {
            log.error("Objeto {} ficou órfão após falha ao salvar metadados.", objectKey, cleanupFailure);
        }
    }

    private void deleteReplacedObject(String objectKey, Long documentId) {
        try {
            objectStorageService.delete(objectKey);
        } catch (RuntimeException exception) {
            log.error("Objeto {} ficou órfão após substituir documento {}.", objectKey, documentId, exception);
        }
    }
}
