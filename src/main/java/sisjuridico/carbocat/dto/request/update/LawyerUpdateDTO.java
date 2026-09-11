package sisjuridico.carbocat.dto.request.update;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record LawyerUpdateDTO(
        @Size(min = 3, max = 100)
        String name,

        @Pattern(
                regexp = "^(\\d{11}|\\d{14})$",
                message = "O Campo deve ter 11 para CPF ou 14 caracteres para CNPJ"
        )
        String cpfCnpj,

        @Pattern (
                regexp = "(\\d{6})",
                message = "O Campo deve ter 6 caracteres para OAB"
        )
        String oab
){}