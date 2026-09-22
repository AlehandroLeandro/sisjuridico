package sisjuridico.carbocat.specification;

import org.springframework.data.jpa.domain.Specification;
import sisjuridico.carbocat.entities.Lawyer;

import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.criteria.Predicate;

public class LawyerSpecifications {

    public static Specification<Lawyer> withFilters(
            String name,
            String cpfCnpj,
            String oab
    ) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (name != null && !name.isBlank()) {
                predicates.add(builder.like(
                        builder.lower(root.get("name")),
                        "%" + name.toLowerCase() + "%"
                ));
            }

            if (cpfCnpj != null && !cpfCnpj.isBlank()) {
                predicates.add(builder.like(
                        root.get("cpfCnpj"),
                        "%" + cpfCnpj + "%"
                ));
            }

            if (oab != null && !oab.isBlank()) {
                predicates.add(builder.like(
                        root.get("oab"),
                        "%" + oab + "%"
                ));
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };
    }
}