package sisjuridico.carbocat.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
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
import sisjuridico.carbocat.dto.request.UserCreateDTO;
import sisjuridico.carbocat.dto.request.UserUpdateDTO;
import sisjuridico.carbocat.service.UserService;
import sisjuridico.carbocat.dto.response.UserResponseDTO;
@RestController
@RequestMapping("/users")
@AllArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> findAll(@RequestParam(required = false) String name){
        if(name != null && !name.isBlank()) {
            return ResponseEntity.ok(userService.findByUserName(name));
        }
        return ResponseEntity.ok(userService.findAll());
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
    public ResponseEntity<UserResponseDTO> updateComplete(@PathVariable Long id, @RequestBody @Valid UserCreateDTO dto){
        return ResponseEntity.ok(userService.updateComplete(id, dto));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UserResponseDTO> update(@PathVariable Long id, @RequestBody @Valid UserUpdateDTO dto){
        return ResponseEntity.ok(userService.update(id, dto));
    }
}