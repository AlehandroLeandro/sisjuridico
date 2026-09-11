package sisjuridico.carbocat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sisjuridico.carbocat.entities.Person;

import java.util.List;

@Repository
public interface PersonRepository extends JpaRepository<Person, Long> {

    List<Person> findByNameContainingIgnoreCase(String name);

    List<Person> findByCpfCnpjContaining(String cpfCnpj);
}