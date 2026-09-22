package sisjuridico.carbocat.dto.response;

import java.time.LocalDate;

public record ContractExtensionResponseDTO(
        Long id,
        Long contractId,
        LocalDate previousEndDate,
        LocalDate newEndDate,
        LocalDate extendedAt,
        String obs
) {}
