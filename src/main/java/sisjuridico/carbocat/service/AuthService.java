package sisjuridico.carbocat.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sisjuridico.carbocat.dto.request.auth.ChangePasswordRequestDTO;
import sisjuridico.carbocat.dto.request.auth.LoginRequestDTO;
import sisjuridico.carbocat.dto.request.auth.LogoutRequestDTO;
import sisjuridico.carbocat.dto.request.auth.RefreshTokenRequestDTO;
import sisjuridico.carbocat.dto.response.auth.LoginResponseDTO;
import sisjuridico.carbocat.dto.response.auth.RefreshTokenResponseDTO;
import sisjuridico.carbocat.entities.RefreshToken;
import sisjuridico.carbocat.entities.User;
import sisjuridico.carbocat.exception.InvalidCredentialsException;
import sisjuridico.carbocat.mapper.AuthMapper;
import sisjuridico.carbocat.repository.RefreshTokenRepository;
import sisjuridico.carbocat.repository.UserRepository;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthMapper authMapper;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${security.refresh-token.expiration-seconds}")
    private Long refreshTokenExpirationSeconds;

    @Transactional
    public LoginResponseDTO login(LoginRequestDTO dto) {
        User user = authenticate(dto);
        String accessToken = jwtService.generateToken(user);
        RefreshToken refreshToken = createRefreshToken(user);

        return authMapper.toLoginResponseDTO(
                accessToken,
                refreshToken.getToken(),
                jwtService.getExpirationSeconds(),
                user
        );
    }

    @Transactional
    public RefreshTokenResponseDTO refreshToken(RefreshTokenRequestDTO dto) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(dto.refreshToken())
                .orElseThrow(InvalidCredentialsException::new);

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new InvalidCredentialsException();
        }

        String accessToken = jwtService.generateToken(refreshToken.getUser());

        return authMapper.toRefreshTokenResponseDTO(
                accessToken,
                jwtService.getExpirationSeconds()
        );
    }

    @Transactional
    public void logout(LogoutRequestDTO dto) {
        refreshTokenRepository.deleteByToken(dto.refreshToken());
    }

    @Transactional
    public void changePassword(ChangePasswordRequestDTO dto, User authenticatedUser) {
        User user = userRepository.findById(authenticatedUser.getId())
                .orElseThrow(InvalidCredentialsException::new);

        boolean currentPasswordMatches = passwordEncoder.matches(
                dto.currentPassword(),
                user.getPassword()
        );

        if (!currentPasswordMatches) {
            throw new InvalidCredentialsException();
        }

        user.setPassword(passwordEncoder.encode(dto.newPassword()));
        userRepository.save(user);
        refreshTokenRepository.deleteByUser(user);
    }

    private User authenticate(LoginRequestDTO dto){
        User user = userRepository.findByUserName(dto.userName())
                .orElseThrow(InvalidCredentialsException::new);
        boolean passwordMatches = passwordEncoder.matches(dto.password(), user.getPassword());

        if(!passwordMatches) {
            throw new InvalidCredentialsException();
        }

        return user;
    }

    private RefreshToken createRefreshToken(User user) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now().plusSeconds(refreshTokenExpirationSeconds));

        return refreshTokenRepository.save(refreshToken);
    }
}
