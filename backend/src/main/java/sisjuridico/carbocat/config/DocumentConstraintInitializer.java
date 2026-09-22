package sisjuridico.carbocat.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Adds the Document owner invariant to databases that predate the entity
 * mapping. Hibernate emits {@code @Check} when creating the table, but schema
 * update does not reliably add new check constraints to existing tables.
 */
@Component
@RequiredArgsConstructor
public class DocumentConstraintInitializer implements ApplicationRunner {

    private static final String CONSTRAINT_NAME = "ck_documents_contract_or_lawsuit";

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        Boolean exists = jdbcTemplate.queryForObject("""
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.table_constraints
                    WHERE table_schema = current_schema()
                      AND table_name = 'documents'
                      AND constraint_name = 'ck_documents_contract_or_lawsuit'
                )
                """, Boolean.class);

        if (!Boolean.TRUE.equals(exists)) {
            jdbcTemplate.execute("""
                    ALTER TABLE documents
                    ADD CONSTRAINT ck_documents_contract_or_lawsuit
                    CHECK ((contract_id IS NOT NULL) <> (lawsuit_id IS NOT NULL))
                    """);
        }
    }
}
