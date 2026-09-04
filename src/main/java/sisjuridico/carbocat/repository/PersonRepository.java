package sisjuridico.carbocat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sisjuridico.carbocat.entities.Person;

@Repository
public interface PersonRepository extends JpaRepository<Person, Long> {
    
}