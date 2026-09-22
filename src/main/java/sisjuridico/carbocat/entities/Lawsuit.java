package sisjuridico.carbocat.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sisjuridico.carbocat.enums.*;

import java.math.BigDecimal;
import java.time.LocalDate;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table( name = "lawsuit")
public class Lawsuit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotNull(message = "O número do processo não pode ser nulo")
    @Min(value = 1, message = "O número do processo deve ser maior que zero")
    private Long numProcesso;

    @NotNull
    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "person_id", nullable = false)
    private Person person;

    @NotNull
    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "lawyer_id", nullable = false)
    private Lawyer lawyer;

    @NotNull
    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "counterPart_person_id", nullable = false)
    private Person counterPartPerson;

    @NotNull
    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "counterPart_lawyer_id", nullable = false)
    private Lawyer counterPartLawyer;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rit rit;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Court court;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InitialOrganization initialOrganization;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PositionClient positionClient;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Nature nature;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Action action;

    @DecimalMin(value = "0.1", inclusive = true, message = "O valor da causa deve ser maior que zero")
    @Digits(integer = 10, fraction = 2, message = "O valor da causa deve ter no máximo 10 dígitos inteiros e 2 dígitos decimais")
    @Column(nullable = true, precision = 12, scale = 2)
    private BigDecimal valorDaCausa;

    @Column(nullable = true)
    private LocalDate dataValorCausa;

    @NotNull
    @Column(nullable = false)
    private LocalDate dataInicio;

    @Size(max = 2000)
    @Column(nullable = true, length = 2000)
    private String observacao;

}
