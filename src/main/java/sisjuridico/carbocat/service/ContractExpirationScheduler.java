package sisjuridico.carbocat.service;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@AllArgsConstructor
public class ContractExpirationScheduler {

    private final ContractService contractService;

    @Transactional
    @Scheduled(cron = "${app.contract.expiration-cron:0 0 0 * * *}", zone = "${app.contract.expiration-zone:America/Bahia}")
    public void deactivateExpiredContracts() {
        contractService.deactivateExpiredContracts(LocalDate.now());
    }
}
