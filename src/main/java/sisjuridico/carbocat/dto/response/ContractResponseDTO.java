package sisjuridico.carbocat.dto.response;

import sisjuridico.carbocat.enums.TypeContract;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ContractResponseDTO(
    Long id,
    String file,
    LocalDate startDate,
    LocalDate endDate,
    Integer adviceLeftDays,
    BigDecimal value,
    String obs,
    boolean active,
    Long contractorId,
    Long contractedId,
    TypeContract typeContract
) {}
