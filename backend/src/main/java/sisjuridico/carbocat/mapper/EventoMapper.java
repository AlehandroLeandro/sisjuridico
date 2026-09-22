package sisjuridico.carbocat.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import sisjuridico.carbocat.dto.request.create.EventoCreateDTO;
import sisjuridico.carbocat.dto.request.update.EventoUpdateDTO;
import sisjuridico.carbocat.dto.response.EventoResponseDTO;
import sisjuridico.carbocat.entities.Evento;

@Mapper(componentModel = "spring")
public interface EventoMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "contract", ignore = true)
    @Mapping(target = "lawsuit", ignore = true)
    Evento toEntity(EventoCreateDTO dto);

    @Mapping(target = "contractId", source = "contract.id")
    @Mapping(target = "lawsuitId", source = "lawsuit.id")
    EventoResponseDTO toResponse(Evento evento);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "contract", ignore = true)
    @Mapping(target = "lawsuit", ignore = true)
    void updateEntity(EventoUpdateDTO dto, @MappingTarget Evento evento);
}
