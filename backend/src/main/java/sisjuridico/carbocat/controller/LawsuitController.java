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
import sisjuridico.carbocat.dto.request.create.LawsuitCreateDTO;
import sisjuridico.carbocat.dto.request.update.LawsuitUpdateDTO;
import sisjuridico.carbocat.dto.response.LawsuitResponseDTO;
import sisjuridico.carbocat.enums.Action;
import sisjuridico.carbocat.enums.Court;
import sisjuridico.carbocat.enums.InitialOrganization;
import sisjuridico.carbocat.enums.Nature;
import sisjuridico.carbocat.enums.PositionClient;
import sisjuridico.carbocat.enums.Rit;
import sisjuridico.carbocat.service.LawsuitService;
import sisjuridico.carbocat.config.PageableRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/lawsuits")
@AllArgsConstructor
public class LawsuitController {
    private final LawsuitService lawsuitService;

    @GetMapping
    public ResponseEntity<Page<LawsuitResponseDTO>> findAll(
            @RequestParam(required = false) Long numProcesso,
            @RequestParam(required = false) Long personId,
            @RequestParam(required = false) Long lawyerId,
            @RequestParam(required = false) Long counterPartPersonId,
            @RequestParam(required = false) Long counterPartLawyerId,
            @RequestParam(required = false) Rit rit,
            @RequestParam(required = false) Court court,
            @RequestParam(required = false) InitialOrganization initialOrganization,
            @RequestParam(required = false) PositionClient positionClient,
            @RequestParam(required = false) Nature nature,
            @RequestParam(required = false) Action action,
            @RequestParam(required = false) BigDecimal valorDaCausa,
            @RequestParam(required = false) LocalDate dataValorCausa,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id,asc") List<String> sort
    ) {
        return ResponseEntity.ok(lawsuitService.findByFilters(
                numProcesso, personId, lawyerId, counterPartPersonId, counterPartLawyerId, rit, court,
                initialOrganization, positionClient, nature, action, valorDaCausa, dataValorCausa,
                PageableRequest.of(page, size, sort, "id")));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LawsuitResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(lawsuitService.findById(id));
    }

    @PostMapping
    public ResponseEntity<LawsuitResponseDTO> save(@RequestBody @Valid LawsuitCreateDTO dto) {
        LawsuitResponseDTO response = lawsuitService.save(dto);
        return ResponseEntity.created(URI.create("/lawsuits/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LawsuitResponseDTO> updateFull(@PathVariable Long id, @RequestBody @Valid LawsuitCreateDTO dto) {
        return ResponseEntity.ok(lawsuitService.updateFull(id, dto));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<LawsuitResponseDTO> update(@PathVariable Long id, @RequestBody @Valid LawsuitUpdateDTO dto) {
        return ResponseEntity.ok(lawsuitService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<LawsuitResponseDTO> delete(@PathVariable Long id) {
        return ResponseEntity.ok(lawsuitService.delete(id));
    }
}
