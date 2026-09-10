package sisjuridico.carbocat.mapper;

import java.util.List;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import sisjuridico.carbocat.dto.request.UserCreateDTO;
import sisjuridico.carbocat.dto.request.UserUpdateDTO;


import sisjuridico.carbocat.dto.response.UserResponseDTO;
import sisjuridico.carbocat.entities.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "id", ignore = true)
    User toEntity(UserCreateDTO dto);

    UserResponseDTO toResponse(User user);

    List<UserResponseDTO> toResponseList(List<User> users);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(UserUpdateDTO dto, @MappingTarget User user);

    @Mapping(target = "id", ignore = true )
    void updateEntityFromCreateDto(UserCreateDTO dto, @MappingTarget User user);
}