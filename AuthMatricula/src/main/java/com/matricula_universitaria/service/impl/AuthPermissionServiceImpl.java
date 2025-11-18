package com.matricula_universitaria.service.impl;

import com.matricula_universitaria.dto.AuthPermissionRequestDto;
import com.matricula_universitaria.dto.AuthPermissionResponseDto;
import com.matricula_universitaria.entity.AuthPermission;
import com.matricula_universitaria.exceptions.BadRequestException;
import com.matricula_universitaria.exceptions.ResourceNotFoundException;
import com.matricula_universitaria.mapper.AuthPermissionMapper;
import com.matricula_universitaria.repository.AuthPermissionRepository;
import com.matricula_universitaria.service.AuthPermissionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AuthPermissionServiceImpl implements AuthPermissionService {

    private final AuthPermissionRepository permissionRepository;
    private final AuthPermissionMapper permissionMapper;

    public AuthPermissionServiceImpl(AuthPermissionRepository permissionRepository,
                                     AuthPermissionMapper permissionMapper) {
        this.permissionRepository = permissionRepository;
        this.permissionMapper = permissionMapper;
    }

    @Override
    public AuthPermissionResponseDto crear(AuthPermissionRequestDto request) {
        permissionRepository.findByNombreIgnoreCase(request.nombre())
                .ifPresent(p -> { throw new BadRequestException("Ya existe un permiso con nombre " + request.nombre()); });

        AuthPermission entity = permissionMapper.toEntity(request);
        AuthPermission saved = permissionRepository.save(entity);
        return permissionMapper.toResponseDto(saved);
    }

    @Override
    public AuthPermissionResponseDto actualizar(Long id, AuthPermissionRequestDto request) {
        AuthPermission entity = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permiso no encontrado con id " + id));

        if (!entity.getNombre().equalsIgnoreCase(request.nombre())) {
            permissionRepository.findByNombreIgnoreCase(request.nombre())
                    .ifPresent(p -> { throw new BadRequestException("Ya existe un permiso con nombre " + request.nombre()); });
        }

        permissionMapper.updateEntityFromDto(request, entity);
        AuthPermission updated = permissionRepository.save(entity);
        return permissionMapper.toResponseDto(updated);
    }

    @Override
    public void eliminar(Long id) {
        AuthPermission entity = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permiso no encontrado con id " + id));
        permissionRepository.delete(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthPermissionResponseDto obtenerPorId(Long id) {
        AuthPermission entity = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permiso no encontrado con id " + id));
        return permissionMapper.toResponseDto(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuthPermissionResponseDto> listarTodos() {
        return permissionRepository.findAll().stream()
                .map(permissionMapper::toResponseDto)
                .toList();
    }
}
