package sisjuridico.carbocat.specification;

import org.springframework.data.jpa.domain.Specification;
import sisjuridico.carbocat.entities.Lawsuit;
import sisjuridico.carbocat.enums.Action;
import sisjuridico.carbocat.enums.Court;
import sisjuridico.carbocat.enums.InitialOrganization;
import sisjuridico.carbocat.enums.Nature;
import sisjuridico.carbocat.enums.PositionClient;
import sisjuridico.carbocat.enums.Rit;

public final class LawsuitSpecifications {

    private LawsuitSpecifications() {
    }

    public static Specification<Lawsuit> withFilters(Long numProcesso, Long personId, Long lawyerId,
                                                      Long counterPartPersonId, Long counterPartLawyerId, Rit rit,
                                                      Court court, InitialOrganization initialOrganization,
                                                      PositionClient positionClient, Nature nature, Action action) {
        return (root, query, builder) -> builder.and(
                numProcesso == null ? builder.conjunction() : builder.equal(root.get("numProcesso"), numProcesso),
                personId == null ? builder.conjunction() : builder.equal(root.get("person").get("id"), personId),
                lawyerId == null ? builder.conjunction() : builder.equal(root.get("lawyer").get("id"), lawyerId),
                counterPartPersonId == null ? builder.conjunction() : builder.equal(root.get("counterPartPerson").get("id"), counterPartPersonId),
                counterPartLawyerId == null ? builder.conjunction() : builder.equal(root.get("counterPartLawyer").get("id"), counterPartLawyerId),
                rit == null ? builder.conjunction() : builder.equal(root.get("rit"), rit),
                court == null ? builder.conjunction() : builder.equal(root.get("court"), court),
                initialOrganization == null ? builder.conjunction() : builder.equal(root.get("initialOrganization"), initialOrganization),
                positionClient == null ? builder.conjunction() : builder.equal(root.get("positionClient"), positionClient),
                nature == null ? builder.conjunction() : builder.equal(root.get("nature"), nature),
                action == null ? builder.conjunction() : builder.equal(root.get("action"), action)
        );
    }
}
