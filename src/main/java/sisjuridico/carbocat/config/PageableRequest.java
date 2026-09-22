package sisjuridico.carbocat.config;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.List;

public final class PageableRequest {
    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;

    private PageableRequest() {
    }

    public static Pageable of(int page, int size, List<String> sorts, String defaultProperty) {
        return of(page, size, sorts, Sort.by(defaultProperty));
    }

    public static Pageable of(int page, int size, List<String> sorts, Sort defaultSort) {
        if (page < 0) {
            throw new IllegalArgumentException("page deve ser maior ou igual a zero.");
        }
        if (size <= 0) {
            throw new IllegalArgumentException("size deve ser maior que zero.");
        }
        List<Sort.Order> orders = new ArrayList<>();
        for (String sort : sorts == null ? List.<String>of() : sorts) {
            String[] parts = sort.split(",", -1);
            if (parts.length == 0 || parts.length > 2 || parts[0].isBlank()) {
                throw new IllegalArgumentException("sort inválido.");
            }
            Sort.Direction direction = parts.length == 2
                    ? Sort.Direction.fromOptionalString(parts[1]).orElseThrow(() -> new IllegalArgumentException("Direção de sort inválida."))
                    : Sort.Direction.ASC;
            orders.add(new Sort.Order(direction, parts[0]));
        }
        if (orders.isEmpty()) {
            return PageRequest.of(page, Math.min(size, MAX_SIZE), defaultSort);
        }
        return PageRequest.of(page, Math.min(size, MAX_SIZE), Sort.by(orders));
    }

    public static int defaultSize() {
        return DEFAULT_SIZE;
    }
}
