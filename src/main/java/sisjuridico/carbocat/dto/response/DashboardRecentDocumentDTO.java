package sisjuridico.carbocat.dto.response;

import java.time.Instant;

public record DashboardRecentDocumentDTO(Long id, String fileName, String linkedEntityLabel, Instant createdAt) {
}
