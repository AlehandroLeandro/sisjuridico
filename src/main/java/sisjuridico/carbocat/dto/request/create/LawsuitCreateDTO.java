package sisjuridico.carbocat.dto.request.create;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import sisjuridico.carbocat.enums.Action;
import sisjuridico.carbocat.enums.Court;
import sisjuridico.carbocat.enums.InitialOrganization;
import sisjuridico.carbocat.enums.Nature;
import sisjuridico.carbocat.enums.PositionClient;
import sisjuridico.carbocat.enums.Rit;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LawsuitCreateDTO(
        @NotNull @Positive Long numProcesso,
        @NotNull Long personId,
        @NotNull Long lawyerId,
        @NotNull Long counterPartPersonId,
        @NotNull Long counterPartLawyerId,
        @NotNull Rit rit,
        @NotNull Court court,
        @NotNull InitialOrganization initialOrganization,
        @NotNull PositionClient positionClient,
        @NotNull Nature nature,
        @NotNull Action action,
        @DecimalMin(value = "0.1") @Digits(integer = 10, fraction = 2) BigDecimal valorDaCausa,
        LocalDate dataValorCausa,
        @DecimalMin(value = "0.1") @Digits(integer = 10, fraction = 2) BigDecimal valorProvisionado,
        LocalDate dataValorProvisionado,
        @DecimalMin(value = "0.1") @Digits(integer = 10, fraction = 2) BigDecimal valorAcordo,
        LocalDate dataValorAcordo,
        @DecimalMin(value = "0.1") @Digits(integer = 10, fraction = 2) BigDecimal custoProcesso,
        LocalDate dataCustoProcesso,
        @DecimalMin(value = "0.1") @Digits(integer = 10, fraction = 2) BigDecimal valorSentenca,
        LocalDate dataValorSentenca) {
}
