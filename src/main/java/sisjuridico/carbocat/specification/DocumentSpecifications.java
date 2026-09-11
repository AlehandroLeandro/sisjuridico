package sisjuridico.carbocat.specification;

import org.springframework.data.jpa.domain.Specification;
import sisjuridico.carbocat.entities.Document;

public final class DocumentSpecifications {

    private DocumentSpecifications() {
    }

    public static Specification<Document> withFilters(String fileName, String contentType, Long contractId) {
        return (root, query, builder) -> builder.and(
                fileName == null || fileName.isBlank() ? builder.conjunction() : builder.like(builder.lower(root.get("fileName")), "%" + fileName.toLowerCase() + "%"),
                contentType == null || contentType.isBlank() ? builder.conjunction() : builder.equal(root.get("contentType"), contentType),
                contractId == null ? builder.conjunction() : builder.equal(root.get("contract").get("id"), contractId)
        );
    }
}
