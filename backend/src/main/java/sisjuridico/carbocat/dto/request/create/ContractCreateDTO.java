package sisjuridico.carbocat.dto.request.create;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import sisjuridico.carbocat.enums.TypeContract;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ContractCreateDTO(
        @NotBlank String file,
        @NotNull LocalDate startDate,
        LocalDate endDate,
        Integer adviceLeftDays,
        @NotNull @DecimalMin(value = "0.1") BigDecimal value,
        @Size(max = 255) String obs,
        @NotNull Boolean active,
        @NotNull Long contractorId,
        @NotNull Long contractedId,
        @NotNull TypeContract typeContract
) {}
