package sisjuridico.carbocat.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import sisjuridico.carbocat.dto.request.create.UserCreateDTO;
import sisjuridico.carbocat.dto.request.update.UserUpdateDTO;
import sisjuridico.carbocat.service.UserService;
import sisjuridico.carbocat.dto.response.UserResponseDTO;
import sisjuridico.carbocat.enums.Role;
@RestController
@RequestMapping("/users")
@AllArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> findAll(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Role role) {
        return ResponseEntity.ok(userService.findByFilters(name, role));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> findByID(@PathVariable Long id){
        return ResponseEntity.ok(userService.findById(id));
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> save(@RequestBody @Valid UserCreateDTO dto){
        UserResponseDTO savedUser = userService.save(dto);

        URI location = URI.create("/users/" + savedUser.id());

        return ResponseEntity.created(location).body(savedUser);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateFull(@PathVariable Long id, @RequestBody @Valid UserCreateDTO dto){
        return ResponseEntity.ok(userService.updateFull(id, dto));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UserResponseDTO> update(@PathVariable Long id, @RequestBody @Valid UserUpdateDTO dto){
        return ResponseEntity.ok(userService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<UserResponseDTO> delete(@PathVariable Long id){
        return ResponseEntity.ok(userService.delete(id));
    }
}
