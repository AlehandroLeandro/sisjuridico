package sisjuridico.carbocat.dto.response;

import sisjuridico.carbocat.enums.Action;
import sisjuridico.carbocat.enums.Court;
import sisjuridico.carbocat.enums.InitialOrganization;
import sisjuridico.carbocat.enums.Nature;
import sisjuridico.carbocat.enums.PositionClient;
import sisjuridico.carbocat.enums.Rit;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LawsuitResponseDTO(
        Long id,
        Long numProcesso,
        Long personId,
        Long lawyerId,
        Long counterPartPersonId,
        Long counterPartLawyerId,
        Rit rit, Court court,
        InitialOrganization initialOrganization,
        PositionClient positionClient,
        Nature nature,
        Action action,
        BigDecimal valorDaCausa,
        LocalDate dataValorCausa,
        BigDecimal valorProvisionado,
        LocalDate dataValorProvisionado,
        BigDecimal valorAcordo,
        LocalDate dataValorAcordo,
        BigDecimal custoProcesso,
        LocalDate dataCustoProcesso,
        BigDecimal valorSentenca,
        LocalDate dataValorSentenca
) {}
