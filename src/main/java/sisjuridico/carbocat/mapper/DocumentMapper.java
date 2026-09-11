package sisjuridico.carbocat.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import sisjuridico.carbocat.dto.request.create.DocumentCreateDTO;
import sisjuridico.carbocat.dto.request.update.DocumentUpdateDTO;
import sisjuridico.carbocat.dto.response.DocumentResponseDTO;
import sisjuridico.carbocat.entities.Document;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DocumentMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "contract", ignore = true)
    Document toEntity(DocumentCreateDTO dto);

    @Mapping(target = "contractId", source = "contract.id")
    DocumentResponseDTO toResponse(Document document);

    List<DocumentResponseDTO> toResponseList(List<Document> documents);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "contract", ignore = true)
    void updateEntityFromDto(DocumentUpdateDTO dto, @MappingTarget Document document);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "contract", ignore = true)
    void updateEntityFromCreateDto(DocumentCreateDTO dto, @MappingTarget Document document);
}
