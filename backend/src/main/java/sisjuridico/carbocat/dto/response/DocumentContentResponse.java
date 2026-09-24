package sisjuridico.carbocat.dto.response;

import java.io.InputStream;

/** Conteúdo do arquivo recuperado do armazenamento interno para transmissão pela API. */
public record DocumentContentResponse(
        InputStream content,
        String fileName,
        String contentType,
        long sizeBytes) {
}
