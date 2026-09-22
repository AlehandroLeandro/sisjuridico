package sisjuridico.carbocat.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import sisjuridico.carbocat.dto.response.auth.AuthenticatedUserDTO;
import sisjuridico.carbocat.dto.response.auth.LoginResponseDTO;
import sisjuridico.carbocat.dto.response.auth.RefreshTokenResponseDTO;
import sisjuridico.carbocat.entities.User;

@Mapper(componentModel = "spring")
public interface AuthMapper {

    AuthenticatedUserDTO toAuthenticatedUserDTO(User user);

    @Mapping(target = "accessToken", source = "accessToken")
    @Mapping(target = "refreshToken", source = "refreshToken")
    @Mapping(target = "tokenType", constant = "Bearer")
    @Mapping(target = "expiresIn", source = "expiresIn")
    @Mapping(target = "user", source = "user")
    LoginResponseDTO toLoginResponseDTO(String accessToken, String refreshToken, Long expiresIn, User user);

    @Mapping(target = "accessToken", source = "accessToken")
    @Mapping(target = "tokenType", constant = "Bearer")
    @Mapping(target = "expiresIn", source = "expiresIn")
    RefreshTokenResponseDTO toRefreshTokenResponseDTO(String accessToken, Long expiresIn);
}
