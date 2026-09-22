package sisjuridico.carbocat.dto.request.update;

public record DocumentUpdateDTO(
    String fileName,
    Long contractId,
    Long lawsuitId
) {}
