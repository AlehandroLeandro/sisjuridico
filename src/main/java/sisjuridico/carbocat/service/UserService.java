package sisjuridico.carbocat.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.AllArgsConstructor;
import sisjuridico.carbocat.dto.request.UserCreateDTO;
import sisjuridico.carbocat.dto.response.UserResponseDTO;
import sisjuridico.carbocat.entities.User;
import sisjuridico.carbocat.exception.UserNotFoundException;
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
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        return userMapper.toResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> findByUserName(String username) {
        List<User> users = userRepository.findByNameContainingIgnoreCase(username);

        if(users.isEmpty()){
            throw new UserNotFoundException("No users found with username: " + username);
        }
        return userMapper.toResponseList(users);
    }

    @Transactional
    public UserResponseDTO update(Long id, UserCreateDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));

        user.setName(dto.getName());
        user.setPassword(dto.getPassword());
        user.setRole(dto.getRole());

        User updatedUser = userRepository.save(user);

        return userMapper.toResponse(updatedUser);
    }

    @Transactional
    public UserResponseDTO save(UserCreateDTO dto){
        User user = userMapper.toEntity(dto);
        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

}
