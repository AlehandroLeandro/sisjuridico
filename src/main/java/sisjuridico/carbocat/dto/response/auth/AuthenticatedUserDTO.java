package sisjuridico.carbocat.dto.response.auth;

import sisjuridico.carbocat.enums.Role;

public record AuthenticatedUserDTO(
        Long id,
        String name,
        String userName,
        Role role
) {
}
