package sisjuridico.carbocat.specification;

import org.springframework.data.jpa.domain.Specification;
import sisjuridico.carbocat.entities.Evento;

import java.time.LocalDate;

public final class EventoSpecifications {
    private EventoSpecifications() {
    }

    public static Specification<Evento> withDateRange(LocalDate from, LocalDate to) {
        return (root, query, builder) -> builder.and(
                from == null ? builder.conjunction() : builder.greaterThanOrEqualTo(root.get("data"), from),
                to == null ? builder.conjunction() : builder.lessThanOrEqualTo(root.get("data"), to)
        );
    }
}
