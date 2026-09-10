package sisjuridico.carbocat.dto.request.create;

import sisjuridico.carbocat.enums.Role;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UserCreateDTO(
    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 50)
    String name,

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100)
    String password, 
    
    @NotNull(message = "Role is required")
    Role role
) {}