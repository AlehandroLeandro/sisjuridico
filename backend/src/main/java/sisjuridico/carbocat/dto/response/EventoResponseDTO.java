package sisjuridico.carbocat.dto.response;

import sisjuridico.carbocat.enums.EventType;

import java.time.LocalDate;
import java.time.LocalTime;

public record EventoResponseDTO(
        Long id,
        String titulo,
        EventType tipo,
        LocalDate data,
        LocalTime hora,
        String responsavel,
        String nota,
        Long lawsuitId,
        Long contractId
) {
}
