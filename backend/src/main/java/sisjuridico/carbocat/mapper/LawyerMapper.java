package sisjuridico.carbocat.mapper;

import org.mapstruct.*;
import sisjuridico.carbocat.dto.request.create.LawyerCreateDTO;
import sisjuridico.carbocat.dto.request.update.LawyerUpdateDTO;
import sisjuridico.carbocat.dto.response.LawyerResponseDTO;
import sisjuridico.carbocat.entities.Lawyer;

import java.util.List;

@Mapper(componentModel = "spring")
public interface LawyerMapper {
    @Mapping(target = "id", ignore = true)
    Lawyer toEntity(LawyerCreateDTO dto);

    LawyerResponseDTO toResponse(Lawyer lawyer);

    List<LawyerResponseDTO> toResponseList(List<Lawyer> lawyers);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(LawyerUpdateDTO dto, @MappingTarget Lawyer lawyer);

    @Mapping(target = "id", ignore = true)
    void updateEntityFromCreateDto(LawyerCreateDTO dto, @MappingTarget Lawyer lawyer);
}
