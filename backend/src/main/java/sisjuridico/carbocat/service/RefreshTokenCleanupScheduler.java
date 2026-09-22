package sisjuridico.carbocat.service;

import java.time.Instant;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import sisjuridico.carbocat.repository.RefreshTokenRepository;

@Component
@RequiredArgsConstructor
public class RefreshTokenCleanupScheduler {

    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    @Scheduled(cron = "${app.refresh-token.cleanup-cron:0 0 1 * * *}", zone = "${app.contract.expiration-zone:America/Bahia}")
    public void deleteExpiredRefreshTokens() {
        refreshTokenRepository.deleteByExpiryDateBefore(Instant.now());
    }
}
