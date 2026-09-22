package sisjuridico.carbocat.dto.request.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequestDTO(
        @NotBlank(message = "Username is required")
        @Size(min = 5, max = 50, message = "Username must be between 5 and 50 characteres")
        String userName,

        @NotBlank(message = "Password is required")
        @Size(min = 6, max = 100, message = "Password must have at leat 6 characteres")
        String password
) {}
