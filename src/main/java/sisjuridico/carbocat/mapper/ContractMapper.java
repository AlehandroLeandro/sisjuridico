package sisjuridico.carbocat.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import sisjuridico.carbocat.dto.request.create.ContractCreateDTO;
import sisjuridico.carbocat.dto.request.update.ContractUpdateDTO;
import sisjuridico.carbocat.dto.response.ContractResponseDTO;
import sisjuridico.carbocat.entities.Contract;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ContractMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "documents", ignore = true)
    @Mapping(target = "contractor", ignore = true)
    @Mapping(target = "contracted", ignore = true)
    Contract toEntity(ContractCreateDTO dto);

    @Mapping(target = "contractorId", source = "contractor.id")
    @Mapping(target = "contractedId", source = "contracted.id")
    ContractResponseDTO toResponse(Contract contract);

    List<ContractResponseDTO> toResponseList(List<Contract> contracts);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "documents", ignore = true)
    @Mapping(target = "contractor", ignore = true)
    @Mapping(target = "contracted", ignore = true)
    void updateEntityFromDto(ContractUpdateDTO dto, @MappingTarget Contract contract);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "documents", ignore = true)
    @Mapping(target = "contractor", ignore = true)
    @Mapping(target = "contracted", ignore = true)
    void updateEntityFromCreateDto(ContractCreateDTO dto, @MappingTarget Contract contract);
}
