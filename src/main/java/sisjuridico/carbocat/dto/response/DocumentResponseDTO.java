package sisjuridico.carbocat.dto.response;

public record DocumentResponseDTO(
    Long id,
    String fileName,
    String contentType,
    String storagePath,
    Long contractId
) {}
