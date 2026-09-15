package sisjuridico.carbocat.dto.request.create;

import jakarta.validation.constraints.NotBlank;

public record DocumentCreateDTO(
    @NotBlank String fileName,
    @NotBlank String contentType,
    @NotBlank String storagePath,
    Long contractId,
    Long lawsuitId
) {}
