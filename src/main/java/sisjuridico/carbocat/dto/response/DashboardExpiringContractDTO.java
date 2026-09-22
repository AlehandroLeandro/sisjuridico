package sisjuridico.carbocat.dto.response;

import sisjuridico.carbocat.enums.TypeContract;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DashboardExpiringContractDTO(Long id, String contractorName, TypeContract type, BigDecimal value,
                                           long daysRemaining, LocalDate endDate) {
}
