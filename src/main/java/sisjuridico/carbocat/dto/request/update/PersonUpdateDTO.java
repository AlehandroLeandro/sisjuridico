package sisjuridico.carbocat.dto.request.update;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PersonUpdateDTO(
        @Size(min = 3, max = 100)//name fica opicional do update
        String name,

        @Pattern(
                regexp = "^(\\d{11}|\\d{14})$",
                message = "O Campo deve ter 11 para CPF ou 14 caracteres para CNPJ"
        )
        String cpfCnpj
) {
}
