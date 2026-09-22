package sisjuridico.carbocat.service;

import org.springframework.transaction.annotation.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import sisjuridico.carbocat.dto.request.create.PersonCreateDTO;
import sisjuridico.carbocat.dto.request.update.PersonUpdateDTO;
import sisjuridico.carbocat.dto.response.PersonResponseDTO;
import sisjuridico.carbocat.entities.Person;
import sisjuridico.carbocat.exception.ResourceNotFoundException;
import sisjuridico.carbocat.mapper.PersonMapper;
import sisjuridico.carbocat.repository.PersonRepository;
import sisjuridico.carbocat.specification.PersonSpecifications;

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
    public Page<PersonResponseDTO> findByFilters(String name, String cpfCnpj, Pageable pageable) {
        return personRepository.findAll(PersonSpecifications.withFilters(name, cpfCnpj), pageable)
                .map(personMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public PersonResponseDTO findById(Long id){
        Person person = personRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.byId(Person.class, id));
        return personMapper.toResponse(person);
    }

    @Transactional
    public PersonResponseDTO updateFull(Long id, PersonCreateDTO dto){
        Person person = personRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.byId(Person.class, id) );
        personMapper.updateEntityFromCreateDto(dto, person);

        Person updatedPerson = personRepository.save(person);

        return personMapper.toResponse(updatedPerson);
    }

    @Transactional
    public PersonResponseDTO update(Long id, PersonUpdateDTO dto){
        Person person = personRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.byId(Person.class, id));
        personMapper.updateEntityFromDto(dto, person);

        Person updatedPerson = personRepository.save(person);
        return personMapper.toResponse(updatedPerson);
    }

    @Transactional
    public PersonResponseDTO save(PersonCreateDTO dto){
        Person person = personMapper.toEntity(dto);
        Person savedPerson = personRepository.save(person);
        return personMapper.toResponse(savedPerson);
    }

    @Transactional
    public PersonResponseDTO delete(Long id){
        Person person = personRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.byId(Person.class, id));
        PersonResponseDTO dto = personMapper.toResponse(person);
        personRepository.delete(person);
        return dto;
    }
}
