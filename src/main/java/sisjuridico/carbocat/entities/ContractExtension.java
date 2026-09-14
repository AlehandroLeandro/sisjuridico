package sisjuridico.carbocat.entities;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "contract_extension")
public class ContractExtension {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @NotNull(message = "A data final anterior não pode ser nula")
    @Column(nullable = false)
    private LocalDate previousEndDate;

    @NotNull(message = "A nova data final não pode ser nula")
    @Column(nullable = false)
    private LocalDate newEndDate;

    @NotNull(message = "A data da prorrogação não pode ser nula")
    @Column(nullable = false)
    private LocalDate extendedAt;

    @Column(length = 255)
    @Size(max = 255, message = "O campo de observações deve ter no máximo 255 caracteres")
    private String obs;

    @AssertTrue(message = "A nova data final deve ser posterior à data final anterior")
    public boolean isValidExtensionPeriod() {
        return previousEndDate != null && newEndDate != null && newEndDate.isAfter(previousEndDate);
    }
}
