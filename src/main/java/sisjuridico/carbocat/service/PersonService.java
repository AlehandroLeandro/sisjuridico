package sisjuridico.carbocat.service;

import org.springframework.transaction.annotation.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import sisjuridico.carbocat.dto.response.PersonResponseDTO;
import sisjuridico.carbocat.entities.Person;
import sisjuridico.carbocat.exception.ResorceNotFoundException;
import sisjuridico.carbocat.mapper.PersonMapper;
import sisjuridico.carbocat.repository.PersonRepository;

import java.util.List;

@Service
@Transactional
@AllArgsConstructor
public class PersonService {
    private final PersonRepository personRepository;
    private final PersonMapper personMapper;

    @Transactional(readOnly = true)
    public List<PersonResponseDTO> findAll(){
        List<Person> people = personRepository.findAll();
        return personMapper.toResponseList(people); // pode retornar uma lista vaiz. validar no frontend
    }

    @Transactional(readOnly = true)
    public PersonResponseDTO findById(Long id){
        Person person = personRepository.findById(id)
                .orElseThrow(() -> ResorceNotFoundException.byId(Person.class, id));
        return personMapper.toResponse(person);
    }

    @Transactional(readOnly = true)
    public List<PersonResponseDTO> findByName(String name){
        List<Person> people = personRepository.findByNameContainingIgnoreCase(name);

        return personMapper.toResponseList(people);
    }

}
