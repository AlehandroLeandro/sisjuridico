package sisjuridico.carbocat.dto.response;

import java.time.Instant;

public record DocumentDownloadResponseDTO(String url, Instant expiresAt) {
}
