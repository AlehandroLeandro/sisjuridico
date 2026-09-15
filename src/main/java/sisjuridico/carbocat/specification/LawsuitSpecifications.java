package sisjuridico.carbocat.specification;

import org.springframework.data.jpa.domain.Specification;
import sisjuridico.carbocat.entities.Lawsuit;
import sisjuridico.carbocat.enums.Action;
import sisjuridico.carbocat.enums.Court;
import sisjuridico.carbocat.enums.InitialOrganization;
import sisjuridico.carbocat.enums.Nature;
import sisjuridico.carbocat.enums.PositionClient;
import sisjuridico.carbocat.enums.Rit;

import java.math.BigDecimal;
import java.time.LocalDate;

public final class LawsuitSpecifications {

    private LawsuitSpecifications() {
    }

    public static Specification<Lawsuit> withFilters(Long numProcesso, Long personId, Long lawyerId,
                                                      Long counterPartPersonId, Long counterPartLawyerId, Rit rit,
                                                      Court court, InitialOrganization initialOrganization,
                                                      PositionClient positionClient, Nature nature, Action action,
                                                      BigDecimal valorDaCausa, LocalDate dataValorCausa,
                                                      BigDecimal valorProvisionado, LocalDate dataValorProvisionado,
                                                      BigDecimal valorAcordo, LocalDate dataValorAcordo,
                                                      BigDecimal custoProcesso, LocalDate dataCustoProcesso,
                                                      BigDecimal valorSentenca, LocalDate dataValorSentenca) {
        return (root, query, builder) -> builder.and(
                SpecificationPredicates.equalOrTrue(root.get("numProcesso"), numProcesso, builder),
                SpecificationPredicates.equalOrTrue(root.get("person").get("id"), personId, builder),
                SpecificationPredicates.equalOrTrue(root.get("lawyer").get("id"), lawyerId, builder),
                SpecificationPredicates.equalOrTrue(root.get("counterPartPerson").get("id"), counterPartPersonId, builder),
                SpecificationPredicates.equalOrTrue(root.get("counterPartLawyer").get("id"), counterPartLawyerId, builder),
                SpecificationPredicates.equalOrTrue(root.get("rit"), rit, builder),
                SpecificationPredicates.equalOrTrue(root.get("court"), court, builder),
                SpecificationPredicates.equalOrTrue(root.get("initialOrganization"), initialOrganization, builder),
                SpecificationPredicates.equalOrTrue(root.get("positionClient"), positionClient, builder),
                SpecificationPredicates.equalOrTrue(root.get("nature"), nature, builder),
                SpecificationPredicates.equalOrTrue(root.get("action"), action, builder),
                SpecificationPredicates.equalOrTrue(root.get("valorDaCausa"), valorDaCausa, builder),
                SpecificationPredicates.equalOrTrue(root.get("dataValorCausa"), dataValorCausa, builder),
                SpecificationPredicates.equalOrTrue(root.get("valorProvisionado"), valorProvisionado, builder),
                SpecificationPredicates.equalOrTrue(root.get("dataValorProvisionado"), dataValorProvisionado, builder),
                SpecificationPredicates.equalOrTrue(root.get("valorAcordo"), valorAcordo, builder),
                SpecificationPredicates.equalOrTrue(root.get("dataValorAcordo"), dataValorAcordo, builder),
                SpecificationPredicates.equalOrTrue(root.get("custoProcesso"), custoProcesso, builder),
                SpecificationPredicates.equalOrTrue(root.get("dataCustoProcesso"), dataCustoProcesso, builder),
                SpecificationPredicates.equalOrTrue(root.get("valorSentenca"), valorSentenca, builder),
                SpecificationPredicates.equalOrTrue(root.get("dataValorSentenca"), dataValorSentenca, builder)
        );
    }
}
