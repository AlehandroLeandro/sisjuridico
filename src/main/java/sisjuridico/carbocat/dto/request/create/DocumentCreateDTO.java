package sisjuridico.carbocat.dto.request.create;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DocumentCreateDTO(
    @NotBlank String fileName,
    @NotBlank String contentType,
    @NotBlank String storagePath,
    @NotNull Long contractId
) {}
