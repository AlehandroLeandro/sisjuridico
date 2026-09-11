package sisjuridico.carbocat.dto.request.update;

import jakarta.validation.constraints.Positive;
import sisjuridico.carbocat.enums.Action;
import sisjuridico.carbocat.enums.Court;
import sisjuridico.carbocat.enums.InitialOrganization;
import sisjuridico.carbocat.enums.Nature;
import sisjuridico.carbocat.enums.PositionClient;
import sisjuridico.carbocat.enums.Rit;

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
        Action action) {
}
