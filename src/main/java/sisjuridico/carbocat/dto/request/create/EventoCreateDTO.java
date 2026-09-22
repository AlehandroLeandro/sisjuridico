package sisjuridico.carbocat.dto.request.create;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import sisjuridico.carbocat.enums.EventType;

import java.time.LocalDate;
import java.time.LocalTime;

public record EventoCreateDTO(
        @NotBlank @Size(max = 150) String titulo,
        @NotNull EventType tipo,
        @NotNull LocalDate data,
        LocalTime hora,
        @Size(max = 255) String responsavel,
        @Size(max = 1000) String nota,
        Long lawsuitId,
        Long contractId
) {
}
