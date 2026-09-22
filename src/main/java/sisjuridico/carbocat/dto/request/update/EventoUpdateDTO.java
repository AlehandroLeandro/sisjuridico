package sisjuridico.carbocat.dto.request.update;

import jakarta.validation.constraints.Size;
import sisjuridico.carbocat.enums.EventType;

import java.time.LocalDate;
import java.time.LocalTime;

public record EventoUpdateDTO(
        @Size(max = 150) String titulo,
        EventType tipo,
        LocalDate data,
        LocalTime hora,
        @Size(max = 255) String responsavel,
        @Size(max = 1000) String nota,
        Long lawsuitId,
        Long contractId
) {
}
