package sisjuridico.carbocat.specification;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import sisjuridico.carbocat.entities.Person;

import java.util.ArrayList;
import java.util.List;

public final class PersonSpecifications {

    private PersonSpecifications() {
    }

    public static Specification<Person> withFilters(String name, String cpfCnpj) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (name != null && !name.isBlank()) {
                predicates.add(builder.like(
                        builder.lower(root.get("name")),
                        "%" + name.toLowerCase() + "%"
                ));
            }

            if (cpfCnpj != null && !cpfCnpj.isBlank()) {
                predicates.add(builder.like(root.get("cpfCnpj"), "%" + cpfCnpj + "%"));
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
