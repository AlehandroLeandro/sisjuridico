package sisjuridico.carbocat.dto.request.update;

public record DocumentUpdateDTO(
    String fileName,
    String contentType,
    String storagePath,
    Long contractId
) {}
