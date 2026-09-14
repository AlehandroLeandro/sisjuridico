package sisjuridico.carbocat.dto.response;

import sisjuridico.carbocat.enums.Role;

public record UserResponseDTO(
    Long id,
    String name,
    String userName,
    Role role
) {}