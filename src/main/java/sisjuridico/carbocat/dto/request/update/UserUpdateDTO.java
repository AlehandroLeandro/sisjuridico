package sisjuridico.carbocat.dto.request.update;

import jakarta.validation.constraints.Size;
import sisjuridico.carbocat.enums.Role;

public record UserUpdateDTO(
    @Size(min = 3, max = 50)
    String name,

    @Size(min = 6, max = 100)
    String password,
    
    Role role
) {}