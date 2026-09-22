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
import sisjuridico.carbocat.dto.request.create.PersonCreateDTO;
import sisjuridico.carbocat.dto.request.update.PersonUpdateDTO;
import sisjuridico.carbocat.dto.response.PersonResponseDTO;
import sisjuridico.carbocat.service.PersonService;
import sisjuridico.carbocat.config.PageableRequest;

@RestController
@RequestMapping("/people")
@AllArgsConstructor
public class PersonController {
    private final PersonService personService;

    @GetMapping
    public ResponseEntity<Page<PersonResponseDTO>> findAll(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String cpfCnpj,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id,asc") List<String> sort) {
        return ResponseEntity.ok(personService.findByFilters(name, cpfCnpj,
                PageableRequest.of(page, size, sort, "id")));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(personService.findById(id));
    }

    @PostMapping
    public ResponseEntity<PersonResponseDTO> save(@RequestBody @Valid PersonCreateDTO dto) {
        PersonResponseDTO savedPerson = personService.save(dto);
        URI location = URI.create("/people/" + savedPerson.id());

        return ResponseEntity.created(location).body(savedPerson);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonResponseDTO> updateFull(
            @PathVariable Long id,
            @RequestBody @Valid PersonCreateDTO dto) {
        return ResponseEntity.ok(personService.updateFull(id, dto));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<PersonResponseDTO> update(
            @PathVariable Long id,
            @RequestBody @Valid PersonUpdateDTO dto) {
        return ResponseEntity.ok(personService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<PersonResponseDTO> delete(@PathVariable Long id) {
        return ResponseEntity.ok(personService.delete(id));
    }
}
