package sisjuridico.carbocat.specification;

import org.springframework.data.jpa.domain.Specification;
import sisjuridico.carbocat.entities.Contract;
import sisjuridico.carbocat.enums.TypeContract;

public final class ContractSpecifications {

    private ContractSpecifications() {
    }

    public static Specification<Contract> withFilters(Boolean active, TypeContract typeContract, Long contractorId, Long contractedId) {
        return (root, query, builder) -> builder.and(
                active == null ? builder.conjunction() : builder.equal(root.get("active"), active),
                typeContract == null ? builder.conjunction() : builder.equal(root.get("typeContract"), typeContract),
                contractorId == null ? builder.conjunction() : builder.equal(root.get("contractor").get("id"), contractorId),
                contractedId == null ? builder.conjunction() : builder.equal(root.get("contracted").get("id"), contractedId)
        );
    }
}
