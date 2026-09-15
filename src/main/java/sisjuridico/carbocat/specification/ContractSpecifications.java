package sisjuridico.carbocat.specification;

import org.springframework.data.jpa.domain.Specification;
import sisjuridico.carbocat.entities.Contract;
import sisjuridico.carbocat.enums.TypeContract;

public final class ContractSpecifications {

    private ContractSpecifications() {
    }

    public static Specification<Contract> withFilters(Boolean active, TypeContract typeContract, Long contractorId, Long contractedId) {
        return (root, query, builder) -> builder.and(
                SpecificationPredicates.equalOrTrue(root.get("active"), active, builder),
                SpecificationPredicates.equalOrTrue(root.get("typeContract"), typeContract, builder),
                SpecificationPredicates.equalOrTrue(root.get("contractor").get("id"), contractorId, builder),
                SpecificationPredicates.equalOrTrue(root.get("contracted").get("id"), contractedId, builder)
        );
    }
}
