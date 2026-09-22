package sisjuridico.carbocat.dto.request.update;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserPasswordUpdateDTO(
        @NotBlank(message = "Password is required")
        @Size(min = 6, max = 100, message = "Password must have between 6 and 100 characteres")
        String password
) {
}
