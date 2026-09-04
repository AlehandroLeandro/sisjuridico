package sisjuridico.carbocat.dto.request;

import sisjuridico.carbocat.enums.Role;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserCreateDTO(
    @NotBlank(message = "Name is required")
    String name,
    @NotBlank(message = "Password is required")
    String password, 
    @NotNull(message = "Role is required")
    Role role
) {}