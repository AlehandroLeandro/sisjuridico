package sisjuridico.carbocat.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.AllArgsConstructor;

import sisjuridico.carbocat.dto.request.create.UserCreateDTO;
import sisjuridico.carbocat.dto.request.update.UserUpdateDTO;
import sisjuridico.carbocat.dto.response.UserResponseDTO;
import sisjuridico.carbocat.entities.User;
import sisjuridico.carbocat.exception.ResourceNotFoundException;
import sisjuridico.carbocat.mapper.UserMapper;
import sisjuridico.carbocat.repository.UserRepository;

@Service
@Transactional
@AllArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public List<UserResponseDTO> findAll() {
        List<User> users = userRepository.findAll();
        return userMapper.toResponseList(users);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->  ResourceNotFoundException.byId(User.class, id));
        return userMapper.toResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> findByUserName(String username) {
        List<User> users = userRepository.findByNameContainingIgnoreCase(username);

        return userMapper.toResponseList(users);
    }

    @Transactional
    public UserResponseDTO updateFull(Long id, UserCreateDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.byId(User.class, id));

        userMapper.updateEntityFromCreateDto(dto, user);
        
        User updatedUser = userRepository.save(user);

        return userMapper.toResponse(updatedUser);
    }

    @Transactional
    public UserResponseDTO update(Long id, UserUpdateDTO dto){
        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.byId(User.class, id));
        userMapper.updateEntityFromDto(dto, user);
        User updatedUser = userRepository.save(user);
        return userMapper.toResponse(updatedUser);
    }

    @Transactional
    public UserResponseDTO save(UserCreateDTO dto){
        User user = userMapper.toEntity(dto);
        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

    @Transactional
    public UserResponseDTO delete(Long id){
        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.byId(User.class, id));
        UserResponseDTO dto = userMapper.toResponse(user);
        userRepository.delete(user);
        return dto;
    }


}
