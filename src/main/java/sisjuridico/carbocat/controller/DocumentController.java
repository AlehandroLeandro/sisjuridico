package sisjuridico.carbocat.controller;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import sisjuridico.carbocat.dto.request.create.DocumentCreateDTO;
import sisjuridico.carbocat.dto.request.update.DocumentUpdateDTO;
import sisjuridico.carbocat.dto.response.DocumentResponseDTO;
import sisjuridico.carbocat.service.DocumentService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/documents")
@AllArgsConstructor
public class DocumentController {
    private final DocumentService documentService;

    @GetMapping
    public ResponseEntity<List<DocumentResponseDTO>> findAll(
        @RequestParam(required = false) String fileName,
        @RequestParam(required = false) String contentType,
        @RequestParam(required = false) Long contractId,
        @RequestParam(required = false) Long lawsuitId
    ) {
        return ResponseEntity.ok(documentService.findByFilters(fileName, contentType, contractId, lawsuitId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.findById(id));
    }

    @PostMapping
    public ResponseEntity<DocumentResponseDTO> save(@RequestBody @Valid DocumentCreateDTO dto) {
        DocumentResponseDTO response = documentService.save(dto);
        return ResponseEntity.created(URI.create("/documents/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentResponseDTO> updateFull(@PathVariable Long id, @RequestBody @Valid DocumentCreateDTO dto) {
        return ResponseEntity.ok(documentService.updateFull(id, dto));
    }

    /**
     * Updates document metadata and, when one owner ID is supplied, transfers
     * ownership to that contract or lawsuit and clears the previous owner.
     * Omitting both owner IDs preserves the current ownership.
     */
    @PatchMapping("/{id}")
    public ResponseEntity<DocumentResponseDTO> update(@PathVariable Long id, @RequestBody @Valid DocumentUpdateDTO dto) {
        return ResponseEntity.ok(documentService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<DocumentResponseDTO> delete(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.delete(id));
    }
}
