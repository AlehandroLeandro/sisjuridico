package sisjuridico.carbocat.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


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

    @ManyToOne
    @JoinColumn(name = "person_id", nullable = false)
    private Person person;

    @ManyToOne
    @JoinColumn(name = "lawyer_id", nullable = false)
    private Lawyer lawyer;

    @ManyToOne
    @JoinColumn(name = "counterPart_person_id", nullable = false)
    private Person counterPartPerson;

    @ManyToOne
    @JoinColumn(name = "counterPart_lawyer_id", nullable = false)
    private Lawyer counterPartLawyer;

    // ver quais os requisitos, se precisar ser uma classe ou se um enum resolve
    /*@ManyToOne
    @JoinColumn(name = "rit_id", nullable = false)
    private Rit rit; //implementar a classe

    @ManyToOne
    @JoinColumn(name = "court_id", nullable = false)
    private Court court; //implementar a classe


    @ManyToOne
    @JoinColumn(name = "initialOrganization_id", nullable = false)
    private InitialOrganization initialOrganization; // implementar a classe

    @ManyToOne
    @JoinColumn(name = "positionClient_id", nullable = false)
    private PositionClient positionClient; // implementar a classe

    @ManyToOne
    @JoinColumn(name = "nature_id", nullable = false)
    private Nature nature; // implementar a classe

    

    @ManyToOne
    @JoinColumn(name = "action_id", nullable = false)
    private Action action; //implementar a classe
     */
}