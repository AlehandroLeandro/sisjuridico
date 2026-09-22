package sisjuridico.carbocat.controller;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
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
import sisjuridico.carbocat.dto.request.create.ContractCreateDTO;
import sisjuridico.carbocat.dto.request.create.ContractExtensionCreateDTO;
import sisjuridico.carbocat.dto.request.update.ContractUpdateDTO;
import sisjuridico.carbocat.dto.response.ContractExtensionResponseDTO;
import sisjuridico.carbocat.dto.response.ContractResponseDTO;
import sisjuridico.carbocat.enums.TypeContract;
import sisjuridico.carbocat.service.ContractService;
import sisjuridico.carbocat.config.PageableRequest;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/contracts")
@AllArgsConstructor
public class ContractController {
    private final ContractService contractService;

    @GetMapping
    public ResponseEntity<Page<ContractResponseDTO>> findAll(@RequestParam(required = false) Boolean active,
                                                              @RequestParam(required = false) TypeContract typeContract,
                                                              @RequestParam(required = false) Long contractorId,
                                                              @RequestParam(required = false) Long contractedId,
                                                              @RequestParam(defaultValue = "0") int page,
                                                              @RequestParam(defaultValue = "20") int size,
                                                              @RequestParam(defaultValue = "id,asc") List<String> sort) {
        return ResponseEntity.ok(contractService.findByFilters(active, typeContract, contractorId, contractedId,
                PageableRequest.of(page, size, sort, "id")));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContractResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(contractService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ContractResponseDTO> save(@RequestBody @Valid ContractCreateDTO dto) {
        ContractResponseDTO response = contractService.save(dto);
        return ResponseEntity.created(URI.create("/contracts/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContractResponseDTO> updateFull(@PathVariable Long id, @RequestBody @Valid ContractCreateDTO dto) {
        return ResponseEntity.ok(contractService.updateFull(id, dto));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ContractResponseDTO> update(@PathVariable Long id, @RequestBody @Valid ContractUpdateDTO dto) {
        return ResponseEntity.ok(contractService.update(id, dto));
    }

    @GetMapping("/{id}/extensions")
    public ResponseEntity<List<ContractExtensionResponseDTO>> findExtensions(@PathVariable Long id) {
        return ResponseEntity.ok(contractService.findExtensions(id));
    }

    @PostMapping("/{id}/extensions")
    public ResponseEntity<ContractExtensionResponseDTO> extend(@PathVariable Long id,
                                                               @RequestBody @Valid ContractExtensionCreateDTO dto) {
        ContractExtensionResponseDTO response = contractService.extend(id, dto);
        return ResponseEntity.created(URI.create("/contracts/" + id + "/extensions/" + response.id())).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ContractResponseDTO> delete(@PathVariable Long id) {
        return ResponseEntity.ok(contractService.delete(id));
    }
}
