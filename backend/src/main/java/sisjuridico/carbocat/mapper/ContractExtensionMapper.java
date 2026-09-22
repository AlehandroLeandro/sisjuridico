package sisjuridico.carbocat.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import sisjuridico.carbocat.dto.response.ContractExtensionResponseDTO;
import sisjuridico.carbocat.entities.ContractExtension;

@Mapper(componentModel = "spring")
public interface ContractExtensionMapper {

    @Mapping(target = "contractId", source = "contract.id")
    ContractExtensionResponseDTO toResponse(ContractExtension extension);

    List<ContractExtensionResponseDTO> toResponseList(List<ContractExtension> extensions);
}
