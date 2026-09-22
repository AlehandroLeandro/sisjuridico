package sisjuridico.carbocat.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
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

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import sisjuridico.carbocat.dto.request.create.LawyerCreateDTO;
import sisjuridico.carbocat.dto.request.update.LawyerUpdateDTO;
import sisjuridico.carbocat.dto.response.LawyerResponseDTO;
import sisjuridico.carbocat.service.LawyerService;
import sisjuridico.carbocat.config.PageableRequest;

@RestController
@RequestMapping("/lawyers")
@AllArgsConstructor
public class LawyerController {
    private final LawyerService lawyerService;

    @GetMapping
    public ResponseEntity<Page<LawyerResponseDTO>> findAll(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String cpfCnpj,
            @RequestParam(required = false) String oab,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id,asc") List<String> sort
    ) {
        return ResponseEntity.ok(
                lawyerService.findByFilters(name, cpfCnpj, oab, PageableRequest.of(page, size, sort, "id")));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LawyerResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(lawyerService.findById(id));
    }

    @PostMapping
    public ResponseEntity<LawyerResponseDTO> save(@RequestBody @Valid LawyerCreateDTO dto) {
        LawyerResponseDTO savedLawyer = lawyerService.save(dto);
        URI location = URI.create("/lawyers/" + savedLawyer.id());

        return ResponseEntity.created(location).body(savedLawyer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LawyerResponseDTO> updateFull(
            @PathVariable Long id,
            @RequestBody @Valid LawyerCreateDTO dto) {
        return ResponseEntity.ok(lawyerService.updateFull(id, dto));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<LawyerResponseDTO> update(
            @PathVariable Long id,
            @RequestBody @Valid LawyerUpdateDTO dto) {
        return ResponseEntity.ok(lawyerService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<LawyerResponseDTO> delete(@PathVariable Long id) {
        return ResponseEntity.ok(lawyerService.delete(id));
    }
}
