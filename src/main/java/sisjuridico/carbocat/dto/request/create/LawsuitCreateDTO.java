package sisjuridico.carbocat.dto.request.create;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import sisjuridico.carbocat.enums.Action;
import sisjuridico.carbocat.enums.Court;
import sisjuridico.carbocat.enums.InitialOrganization;
import sisjuridico.carbocat.enums.Nature;
import sisjuridico.carbocat.enums.PositionClient;
import sisjuridico.carbocat.enums.Rit;

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
        @NotNull Action action) {
}
