package sisjuridico.carbocat.specification;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import sisjuridico.carbocat.entities.User;
import sisjuridico.carbocat.enums.Role;

import java.util.ArrayList;
import java.util.List;

public final class UserSpecifications {

    private UserSpecifications() {
    }

    public static Specification<User> withFilters(String name, Role role) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (name != null && !name.isBlank()) {
                predicates.add(builder.like(
                        builder.lower(root.get("name")),
                        "%" + name.toLowerCase() + "%"
                ));
            }

            if (role != null) {
                predicates.add(builder.equal(root.get("role"), role));
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
