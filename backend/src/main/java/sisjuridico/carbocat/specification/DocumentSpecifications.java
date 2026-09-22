package sisjuridico.carbocat.specification;

import org.springframework.data.jpa.domain.Specification;
import sisjuridico.carbocat.entities.Document;

public final class DocumentSpecifications {

    private DocumentSpecifications() {
    }

    public static Specification<Document> withFilters(String fileName, String contentType, Long contractId, Long lawsuitId) {
        return (root, query, builder) -> builder.and(
                SpecificationPredicates.containsIgnoreCaseOrTrue(root.get("fileName"), fileName, builder),
                SpecificationPredicates.equalIgnoreBlankOrTrue(root.get("contentType"), contentType, builder),
                SpecificationPredicates.equalOrTrue(root.get("contract").get("id"), contractId, builder),
                SpecificationPredicates.equalOrTrue(root.get("lawsuit").get("id"), lawsuitId, builder)
        );
    }
}
