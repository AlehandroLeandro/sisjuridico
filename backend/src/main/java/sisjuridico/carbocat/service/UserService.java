package sisjuridico.carbocat.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import lombok.AllArgsConstructor;

import sisjuridico.carbocat.dto.request.create.UserCreateDTO;
import sisjuridico.carbocat.dto.request.update.UserPasswordUpdateDTO;
import sisjuridico.carbocat.dto.request.update.UserUpdateDTO;
import sisjuridico.carbocat.dto.response.UserResponseDTO;
import sisjuridico.carbocat.entities.User;
import sisjuridico.carbocat.exception.ResourceNotFoundException;
import sisjuridico.carbocat.mapper.UserMapper;
import sisjuridico.carbocat.repository.RefreshTokenRepository;
import sisjuridico.carbocat.repository.UserRepository;
import sisjuridico.carbocat.enums.Role;
import sisjuridico.carbocat.specification.UserSpecifications;

@Service
@Transactional
@AllArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional(readOnly = true)
    public List<UserResponseDTO> findAll() {
        List<User> users = userRepository.findAll();
        return userMapper.toResponseList(users);
    }

    @Transactional(readOnly = true)
    public Page<UserResponseDTO> findByFilters(String name, String userName, Role role, Pageable pageable) {
        return userRepository.findAll(UserSpecifications.withFilters(name, userName, role), pageable)
                .map(userMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->  ResourceNotFoundException.byId(User.class, id));
        return userMapper.toResponse(user);
    }
    @Transactional(readOnly = true)
    public UserResponseDTO findByUserName(String userName) {
        User user = userRepository.findByUserName(userName)
                .orElseThrow(() ->  ResourceNotFoundException.byAttribute(User.class, "userName", userName));
        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponseDTO updateFull(Long id, UserCreateDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.byId(User.class, id));

        userMapper.updateEntityFromCreateDto(dto, user);
        user.setPassword(passwordEncoder.encode(dto.password()));
        refreshTokenRepository.deleteByUser(user);
        
        User updatedUser = userRepository.save(user);

        return userMapper.toResponse(updatedUser);
    }

    @Transactional
    public UserResponseDTO update(Long id, UserUpdateDTO dto){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("User is not authenticated");
        }

        boolean admin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
        if (!admin && (dto.role() != null || dto.userName() != null
                || !(authentication.getPrincipal() instanceof User)
                || !id.equals(((User) authentication.getPrincipal()).getId()))) {
            throw new AccessDeniedException("Users can only update their own name and password");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.byId(User.class, id));

        userMapper.updateEntityFromDto(dto, user);
        if(dto.password() != null && !dto.password().isBlank()){
            user.setPassword(passwordEncoder.encode(dto.password()));
            refreshTokenRepository.deleteByUser(user);
        }

        User updatedUser = userRepository.save(user);

        return userMapper.toResponse(updatedUser);
    }

    @Transactional
    public UserResponseDTO save(UserCreateDTO dto){
        User user = userMapper.toEntity(dto);
        user.setPassword(passwordEncoder.encode(dto.password())); //usa o encoder para fazer o hash da senha que vem pelo dto, sem definir diretamente a senha que vem do DTO pois ela vem sem critografia, além de que ela é ignorada pelo mapper
        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

    @Transactional
    public UserResponseDTO delete(Long id){
        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.byId(User.class, id));
        UserResponseDTO dto = userMapper.toResponse(user);
        refreshTokenRepository.deleteByUser(user);
        userRepository.delete(user);
        return dto;
    }

    @Transactional
    public void updatePassword(Long id, UserPasswordUpdateDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.byId(User.class, id));

        user.setPassword(passwordEncoder.encode(dto.password()));
        userRepository.save(user);
        refreshTokenRepository.deleteByUser(user);
    }

}
