package sisjuridico.carbocat.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import sisjuridico.carbocat.dto.request.UserCreateDTO;


import sisjuridico.carbocat.dto.response.UserResponseDTO;
import sisjuridico.carbocat.entities.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "id", ignore = true)
    User toEntity(UserCreateDTO dto);

    UserResponseDTO toResponse(User user);

    List<UserResponseDTO> toResponseList(List<User> users);

}