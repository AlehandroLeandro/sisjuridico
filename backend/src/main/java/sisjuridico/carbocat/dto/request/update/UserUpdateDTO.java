package sisjuridico.carbocat.dto.request.update;

import jakarta.validation.constraints.Size;
import sisjuridico.carbocat.enums.Role;

public record UserUpdateDTO(
    @Size(min = 3, max = 50, message = "Name must have between 3 and 50 characteres")
    String name,

    @Size(min = 5, max = 50, message = "User name must have between 5 and 50 characteres")
    String userName,

    @Size(min = 6, max = 100, message = "Password must have between 6 and 100 characteres")
    String password,
    
    Role role
) {}