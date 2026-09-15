package sisjuridico.carbocat;

import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import org.hibernate.annotations.Check;
import org.junit.jupiter.api.Test;
import sisjuridico.carbocat.entities.Contract;
import sisjuridico.carbocat.entities.ContractExtension;
import sisjuridico.carbocat.entities.Document;
import sisjuridico.carbocat.entities.Lawsuit;
import sisjuridico.carbocat.entities.RefreshToken;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DocumentPersistenceMappingTest {

    @Test
    void allManyToOneAssociationsAreLazy() {
        Map<Class<?>, String[]> associations = Map.of(
                Contract.class, new String[]{"contractor", "contracted"},
                ContractExtension.class, new String[]{"contract"},
                Document.class, new String[]{"contract", "lawsuit"},
                Lawsuit.class, new String[]{"person", "lawyer", "counterPartPerson", "counterPartLawyer"},
                RefreshToken.class, new String[]{"user"});

        associations.forEach((type, fields) -> {
            for (String fieldName : fields) {
                try {
                    assertEquals(FetchType.LAZY, type.getDeclaredField(fieldName)
                            .getAnnotation(ManyToOne.class).fetch());
                } catch (NoSuchFieldException exception) {
                    throw new AssertionError(exception);
                }
            }
        });
    }

    @Test
    void documentHasDatabaseConstraintRequiringExactlyOneOwner() throws NoSuchFieldException {
        Check check = Document.class.getAnnotation(Check.class);

        assertTrue(check != null);
        assertEquals("ck_documents_contract_or_lawsuit", check.name());
        assertTrue(check.constraints().contains("contract_id IS NOT NULL"));
        assertTrue(check.constraints().contains("lawsuit_id IS NOT NULL"));
    }
}
