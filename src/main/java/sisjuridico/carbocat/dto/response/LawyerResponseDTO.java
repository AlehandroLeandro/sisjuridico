package sisjuridico.carbocat.dto.response;

public record LawyerResponseDTO (
    Long id,
    String name,
    String cpfCnpj,
    String oab
){}
