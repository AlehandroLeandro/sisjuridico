package sisjuridico.carbocat.dto.response;

import java.time.Instant;

public record DocumentResponseDTO(
    Long id,
    String fileName,
    String contentType,
    String storagePath,
    long sizeBytes,
    Instant createdAt,
    Long contractId,
    Long lawsuitId
) {}
