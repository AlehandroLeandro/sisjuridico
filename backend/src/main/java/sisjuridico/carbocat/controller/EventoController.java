package sisjuridico.carbocat.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
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
import sisjuridico.carbocat.config.PageableRequest;
import sisjuridico.carbocat.dto.request.create.EventoCreateDTO;
import sisjuridico.carbocat.dto.request.update.EventoUpdateDTO;
import sisjuridico.carbocat.dto.response.EventoResponseDTO;
import sisjuridico.carbocat.service.EventoService;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/eventos")
@RequiredArgsConstructor
public class EventoController {
    private final EventoService eventoService;

    @GetMapping
    public ResponseEntity<Page<EventoResponseDTO>> findAll(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) List<String> sort) {
        Sort defaultSort = Sort.by(Sort.Order.asc("data"), Sort.Order.asc("hora").nullsLast());
        return ResponseEntity.ok(eventoService.findAll(from, to, PageableRequest.of(page, size, sort, defaultSort)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventoResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(eventoService.findById(id));
    }

    @PostMapping
    public ResponseEntity<EventoResponseDTO> save(@RequestBody @Valid EventoCreateDTO dto) {
        EventoResponseDTO response = eventoService.save(dto);
        return ResponseEntity.created(URI.create("/eventos/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventoResponseDTO> updateFull(@PathVariable Long id, @RequestBody @Valid EventoUpdateDTO dto) {
        return ResponseEntity.ok(eventoService.update(id, dto));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<EventoResponseDTO> update(@PathVariable Long id, @RequestBody @Valid EventoUpdateDTO dto) {
        return ResponseEntity.ok(eventoService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        eventoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
