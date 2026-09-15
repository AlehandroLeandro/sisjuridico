package sisjuridico.carbocat.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import sisjuridico.carbocat.dto.request.create.LawsuitCreateDTO;
import sisjuridico.carbocat.dto.request.update.LawsuitUpdateDTO;
import sisjuridico.carbocat.dto.response.LawsuitResponseDTO;
import sisjuridico.carbocat.entities.Lawsuit;

import java.util.List;

@Mapper(componentModel = "spring")
public interface LawsuitMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "person", ignore = true)
    @Mapping(target = "lawyer", ignore = true)
    @Mapping(target = "counterPartPerson", ignore = true)
    @Mapping(target = "counterPartLawyer", ignore = true)
    @Mapping(target = "documents", ignore = true)
    Lawsuit toEntity(LawsuitCreateDTO dto);

    @Mapping(target = "personId", source = "person.id")
    @Mapping(target = "lawyerId", source = "lawyer.id")
    @Mapping(target = "counterPartPersonId", source = "counterPartPerson.id")
    @Mapping(target = "counterPartLawyerId", source = "counterPartLawyer.id")
    LawsuitResponseDTO toResponse(Lawsuit lawsuit);

    List<LawsuitResponseDTO> toResponseList(List<Lawsuit> lawsuits);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "person", ignore = true)
    @Mapping(target = "lawyer", ignore = true)
    @Mapping(target = "counterPartPerson", ignore = true)
    @Mapping(target = "counterPartLawyer", ignore = true)
    @Mapping(target = "documents", ignore = true)
    void updateEntityFromDto(LawsuitUpdateDTO dto, @MappingTarget Lawsuit lawsuit);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "person", ignore = true)
    @Mapping(target = "lawyer", ignore = true)
    @Mapping(target = "counterPartPerson", ignore = true)
    @Mapping(target = "counterPartLawyer", ignore = true)
    @Mapping(target = "documents", ignore = true)
    void updateEntityFromCreateDto(LawsuitCreateDTO dto, @MappingTarget Lawsuit lawsuit);
}
