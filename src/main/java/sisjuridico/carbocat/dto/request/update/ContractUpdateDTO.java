package sisjuridico.carbocat.dto.request.update;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import sisjuridico.carbocat.enums.TypeContract;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ContractUpdateDTO(
    String file,
    LocalDate startDate,
    LocalDate endDate,
    Integer adviceLeftDays,
    @DecimalMin(value = "0.1") BigDecimal value,
    @Size(max = 255) String obs,
    Boolean active,
    Long contractorId,
    Long contractedId,
    TypeContract typeContract
) {}
