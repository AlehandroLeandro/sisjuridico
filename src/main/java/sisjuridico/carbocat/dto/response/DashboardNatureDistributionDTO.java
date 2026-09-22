package sisjuridico.carbocat.dto.response;

import sisjuridico.carbocat.enums.Nature;

public record DashboardNatureDistributionDTO(Nature nature, long count) {
}
