package sisjuridico.carbocat.dto.request.update;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import sisjuridico.carbocat.enums.Action;
import sisjuridico.carbocat.enums.Court;
import sisjuridico.carbocat.enums.InitialOrganization;
import sisjuridico.carbocat.enums.Nature;
import sisjuridico.carbocat.enums.PositionClient;
import sisjuridico.carbocat.enums.Rit;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LawsuitUpdateDTO(
        @Positive Long numProcesso,
        Long personId,
        Long lawyerId,
        Long counterPartPersonId,
        Long counterPartLawyerId,
        Rit rit,
        Court court,
        InitialOrganization initialOrganization,
        PositionClient positionClient,
        Nature nature,
        Action action,
        @DecimalMin(value = "0.1") @Digits(integer = 10, fraction = 2) BigDecimal valorDaCausa,
        LocalDate dataValorCausa,
        LocalDate dataInicio,
        @Size(max = 2000) String observacao) {
}
