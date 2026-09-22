package sisjuridico.carbocat.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import sisjuridico.carbocat.config.PageableRequest;
import sisjuridico.carbocat.dto.request.update.DocumentUpdateDTO;
import sisjuridico.carbocat.dto.response.DocumentDownloadResponseDTO;
import sisjuridico.carbocat.dto.response.DocumentResponseDTO;
import sisjuridico.carbocat.service.DocumentService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {
    private final DocumentService documentService;

    @GetMapping
    public ResponseEntity<Page<DocumentResponseDTO>> findAll(
            @RequestParam(required = false) String fileName,
            @RequestParam(required = false) String contentType,
            @RequestParam(required = false) Long contractId,
            @RequestParam(required = false) Long lawsuitId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id,asc") List<String> sort) {
        return ResponseEntity.ok(documentService.findByFilters(fileName, contentType, contractId, lawsuitId,
                PageableRequest.of(page, size, sort, "id")));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.findById(id));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<DocumentDownloadResponseDTO> download(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.download(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentResponseDTO> upload(
            @RequestPart MultipartFile file,
            @RequestParam(required = false) String fileName,
            @RequestParam(required = false) Long contractId,
            @RequestParam(required = false) Long lawsuitId) {
        DocumentResponseDTO response = documentService.upload(file, fileName, contractId, lawsuitId);
        return ResponseEntity.created(URI.create("/documents/" + response.id())).body(response);
    }

    @PutMapping(value = "/{id}/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentResponseDTO> replaceFile(@PathVariable Long id, @RequestPart MultipartFile file) {
        return ResponseEntity.ok(documentService.replaceFile(id, file));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<DocumentResponseDTO> update(@PathVariable Long id, @Valid @org.springframework.web.bind.annotation.RequestBody DocumentUpdateDTO dto) {
        return ResponseEntity.ok(documentService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        documentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
