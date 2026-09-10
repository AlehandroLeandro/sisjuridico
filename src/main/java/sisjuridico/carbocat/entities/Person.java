package sisjuridico.carbocat.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.validation.constraints.Pattern;


@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "person")
@Inheritance(strategy = InheritanceType.JOINED)
public class Person {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column (nullable = false)
    @Size(min = 3, max = 100)
    private String name;

    @Column(unique = true)
    @Pattern(
            regexp = "^(\\d{11}|\\d{14})$",
            message = "O Campo deve ter 11 para CPF ou 14 caracteres para CNPJ"
    )
    private String cpfCnpj;
}
