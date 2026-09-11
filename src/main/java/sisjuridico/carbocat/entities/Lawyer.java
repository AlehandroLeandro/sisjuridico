package sisjuridico.carbocat.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table( name = "lawyer")
public class Lawyer extends Person{

    @Column
    @Pattern (
            regexp = "(\\d{6})",
            message = "O Campo deve ter 6 caracteres para OAB"
    )
    private String oab;
}