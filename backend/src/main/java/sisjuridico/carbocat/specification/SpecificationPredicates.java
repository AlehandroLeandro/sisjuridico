package sisjuridico.carbocat.specification;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;

final class SpecificationPredicates {

    private SpecificationPredicates() {
    }

    static <T> Predicate equalOrTrue(Expression<T> expression, T value, CriteriaBuilder builder) {
        return value == null ? builder.conjunction() : builder.equal(expression, value);
    }

    static Predicate containsIgnoreCaseOrTrue(Expression<String> expression, String value,
                                               CriteriaBuilder builder) {
        return value == null || value.isBlank()
                ? builder.conjunction()
                : builder.like(builder.lower(expression), "%" + value.toLowerCase() + "%");
    }

    static Predicate equalIgnoreBlankOrTrue(Expression<String> expression, String value,
                                            CriteriaBuilder builder) {
        return value == null || value.isBlank()
                ? builder.conjunction()
                : builder.equal(expression, value);
    }
}
