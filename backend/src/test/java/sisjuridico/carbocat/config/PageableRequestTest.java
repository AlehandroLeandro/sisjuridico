package sisjuridico.carbocat.config;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PageableRequestTest {

    @Test
    void acceptsDirectionSplitByRequestParameterBinding() {
        Pageable pageable = PageableRequest.of(0, 10, List.of("id", "asc"), "id");

        assertEquals(Sort.Direction.ASC, pageable.getSort().getOrderFor("id").getDirection());
        assertEquals(1, pageable.getSort().stream().count());
    }
}
