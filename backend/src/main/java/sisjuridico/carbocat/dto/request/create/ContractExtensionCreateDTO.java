package sisjuridico.carbocat.dto.request.create;

import java.time.LocalDate;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ContractExtensionCreateDTO(
        @NotNull(message = "A nova data final não pode ser nula")
        @FutureOrPresent(message = "A nova data final não pode estar no passado")
        LocalDate newEndDate,

        @Size(max = 255, message = "O campo de observações deve ter no máximo 255 caracteres")
        String obs
) {}
