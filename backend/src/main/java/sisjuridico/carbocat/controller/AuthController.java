package sisjuridico.carbocat.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import sisjuridico.carbocat.dto.request.auth.ChangePasswordRequestDTO;
import sisjuridico.carbocat.dto.request.auth.LoginRequestDTO;
import sisjuridico.carbocat.dto.request.auth.LogoutRequestDTO;
import sisjuridico.carbocat.dto.request.auth.RefreshTokenRequestDTO;
import sisjuridico.carbocat.dto.response.auth.LoginResponseDTO;
import sisjuridico.carbocat.dto.response.auth.RefreshTokenResponseDTO;
import sisjuridico.carbocat.entities.User;
import sisjuridico.carbocat.service.AuthService;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid LoginRequestDTO dto){
        return ResponseEntity.ok(authService.login(dto));
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponseDTO> refreshToken(
            @RequestBody @Valid RefreshTokenRequestDTO dto
    ) {
        return ResponseEntity.ok(authService.refreshToken(dto));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody @Valid LogoutRequestDTO dto) {
        authService.logout(dto);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @RequestBody @Valid ChangePasswordRequestDTO dto,
            Authentication authentication
    ) {
        User authenticatedUser = (User) authentication.getPrincipal();
        authService.changePassword(dto, authenticatedUser);
        return ResponseEntity.noContent().build();
    }
}
