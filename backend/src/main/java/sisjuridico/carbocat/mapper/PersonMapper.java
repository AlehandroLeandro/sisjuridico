package sisjuridico.carbocat.mapper;

import org.mapstruct.*;
import sisjuridico.carbocat.dto.request.create.PersonCreateDTO;
import sisjuridico.carbocat.dto.request.update.PersonUpdateDTO;
import sisjuridico.carbocat.dto.response.PersonResponseDTO;
import sisjuridico.carbocat.entities.Person;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PersonMapper {
    @Mapping(target = "id", ignore = true)
    Person toEntity(PersonCreateDTO dto);

    PersonResponseDTO toResponse(Person person);

    List<PersonResponseDTO> toResponseList(List<Person> people);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(PersonUpdateDTO dto, @MappingTarget Person person);

    @Mapping(target = "id", ignore = true)
    void updateEntityFromCreateDto(PersonCreateDTO dto, @MappingTarget Person person);
}
