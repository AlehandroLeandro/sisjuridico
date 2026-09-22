package sisjuridico.carbocat.dto.response;

import java.util.List;

public record DashboardResponseDTO(
        List<DashboardKpiDTO> kpis,
        List<DashboardExpiringContractDTO> contratosVencendo,
        List<DashboardRecentDocumentDTO> documentosRecentes,
        List<DashboardNatureDistributionDTO> distribuicaoNatureza,
        List<EventoResponseDTO> proximosEventos
) {
}
