package sisjuridico.carbocat.dto.response.auth;

public record LoginResponseDTO(
        String accessToken,
        String refreshToken,
        String tokenType,
        Long expiresIn,
        AuthenticatedUserDTO user
) {
}
