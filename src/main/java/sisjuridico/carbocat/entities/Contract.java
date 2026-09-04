package sisjuridico.carbocat.entities;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import io.micrometer.common.lang.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
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
@Table( name = "contract")
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String file;

    @Column(nullable = false)
    @NotNull(message = "A data de início do contrato não pode ser nula")
    private LocalDate startDate;

    @Column(nullable = true) // contrato pode ter data final indefinida
    @Nullable
    private LocalDate endDate;

    @Column
    @Nullable
    private int adviceLeftDays;

    @NotNull(message = "O valor do contrato não pode ser nulo")
    @DecimalMin(value = "0.1", inclusive = true, message = "O valor do contrato deve ser maior que zero")
    @Digits(integer = 10, fraction = 2, message = "O valor do contrato deve ter no máximo 10 dígitos inteiros e 2 dígitos decimais")
    @Column(nullable = false, precision = 12, scale = 2) //precision total de digitos, scale quantidade de casas decimais no banco
    private BigDecimal value;

    @Column(length = 255)
    @Size(max = 255, message = "O campo de observações deve ter no máximo 255 caracteres")
    private String obs;

    @Column(nullable = false)
    private boolean active;

    @ManyToOne
    @JoinColumn(name = "contractor_person_id", nullable = false)
    private Person contractor;

    @ManyToOne
    @JoinColumn(name = "contracted_person_id", nullable = false)
    private Person contracted;

    @ManyToOne
    @JoinColumn(name = "typeContract_id", nullable = false)
    private TypeContract typeContract;

    @OneToMany(mappedBy = "contract")
    private List<Documents> documents;

}