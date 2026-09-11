package sisjuridico.carbocat.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sisjuridico.carbocat.enums.*;


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
    @ManyToOne
    @JoinColumn(name = "person_id", nullable = false)
    private Person person;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "lawyer_id", nullable = false)
    private Lawyer lawyer;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "counterPart_person_id", nullable = false)
    private Person counterPartPerson;

    @NotNull
    @ManyToOne
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
}