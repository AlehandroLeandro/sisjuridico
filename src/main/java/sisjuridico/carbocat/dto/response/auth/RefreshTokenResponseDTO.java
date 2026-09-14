package sisjuridico.carbocat.dto.response.auth;

public record RefreshTokenResponseDTO(
        String accessToken,
        String tokenType,
        Long expiresIn
) {
}
