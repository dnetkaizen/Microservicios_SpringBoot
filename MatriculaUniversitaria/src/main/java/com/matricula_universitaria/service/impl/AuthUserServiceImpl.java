package com.matricula_universitaria.service.impl;

import com.matricula_universitaria.dto.AuthUserRequestDto;
import com.matricula_universitaria.dto.AuthUserResponseDto;
import com.matricula_universitaria.entity.AuthRole;
import com.matricula_universitaria.entity.AuthUser;
import com.matricula_universitaria.entity.AuthUserRole;
import com.matricula_universitaria.entity.AuthUserRoleId;
import com.matricula_universitaria.exceptions.BadRequestException;
import com.matricula_universitaria.exceptions.ResourceNotFoundException;
import com.matricula_universitaria.mapper.AuthUserMapper;
import com.matricula_universitaria.repository.AuthRoleRepository;
import com.matricula_universitaria.repository.AuthUserRepository;
import com.matricula_universitaria.repository.AuthUserRoleRepository;
import com.matricula_universitaria.service.AuthUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AuthUserServiceImpl implements AuthUserService {

    private final AuthUserRepository userRepository;
    private final AuthRoleRepository roleRepository;
    private final AuthUserRoleRepository userRoleRepository;
    private final AuthUserMapper userMapper;

    public AuthUserServiceImpl(AuthUserRepository userRepository,
                               AuthRoleRepository roleRepository,
                               AuthUserRoleRepository userRoleRepository,
                               AuthUserMapper userMapper) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.userMapper = userMapper;
    }

    @Override
    public AuthUserResponseDto crear(AuthUserRequestDto request) {
        userRepository.findByUsernameIgnoreCase(request.username())
                .ifPresent(u -> { throw new BadRequestException("Ya existe un usuario con username " + request.username()); });
        userRepository.findByEmailIgnoreCase(request.email())
                .ifPresent(u -> { throw new BadRequestException("Ya existe un usuario con email " + request.email()); });

        AuthUser entity = userMapper.toEntity(request);
        AuthUser saved = userRepository.save(entity);
        return userMapper.toResponse(saved);
    }

    @Override
    public AuthUserResponseDto actualizar(Long id, AuthUserRequestDto request) {
        AuthUser entity = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id " + id));

        if (!entity.getUsername().equalsIgnoreCase(request.username())) {
            userRepository.findByUsernameIgnoreCase(request.username())
                    .ifPresent(u -> { throw new BadRequestException("Ya existe un usuario con username " + request.username()); });
        }
        if (!entity.getEmail().equalsIgnoreCase(request.email())) {
            userRepository.findByEmailIgnoreCase(request.email())
                    .ifPresent(u -> { throw new BadRequestException("Ya existe un usuario con email " + request.email()); });
        }

        userMapper.updateEntity(request, entity);
        AuthUser updated = userRepository.save(entity);
        return userMapper.toResponse(updated);
    }

    @Override
    public void eliminar(Long id) {
        AuthUser entity = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id " + id));
        userRepository.delete(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthUserResponseDto obtenerPorId(Long id) {
        AuthUser entity = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id " + id));
        return userMapper.toResponse(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuthUserResponseDto> listarTodos() {
        return userMapper.toResponseList(userRepository.findAll());
    }

    @Override
    public AuthUserResponseDto asignarRol(Long userId, Long roleId) {
        AuthUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id " + userId));
        AuthRole role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con id " + roleId));

        AuthUserRoleId id = new AuthUserRoleId(user.getId(), role.getId());
        userRoleRepository.findById(id).ifPresent(ur -> {
            throw new BadRequestException("El usuario ya tiene asignado ese rol");
        });

        AuthUserRole ur = AuthUserRole.builder()
                .id(id)
                .user(user)
                .role(role)
                .build();

        userRoleRepository.save(ur);
        user.getUserRoles().add(ur);

        return userMapper.toResponse(user);
    }

    @Override
    public AuthUserResponseDto removerRol(Long userId, Long roleId) {
        AuthUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id " + userId));
        AuthRole role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con id " + roleId));

        AuthUserRoleId id = new AuthUserRoleId(user.getId(), role.getId());
        AuthUserRole ur = userRoleRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("El usuario no tiene asignado ese rol"));

        userRoleRepository.delete(ur);
        user.getUserRoles().remove(ur);

        return userMapper.toResponse(user);
    }
}
