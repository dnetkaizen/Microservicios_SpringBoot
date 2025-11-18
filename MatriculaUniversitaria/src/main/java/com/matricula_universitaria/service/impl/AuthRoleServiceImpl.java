package com.matricula_universitaria.service.impl;

import com.matricula_universitaria.dto.AuthRoleRequestDto;
import com.matricula_universitaria.dto.AuthRoleResponseDto;
import com.matricula_universitaria.entity.AuthPermission;
import com.matricula_universitaria.entity.AuthRole;
import com.matricula_universitaria.entity.AuthRolePermission;
import com.matricula_universitaria.entity.AuthRolePermissionId;
import com.matricula_universitaria.exceptions.BadRequestException;
import com.matricula_universitaria.exceptions.ResourceNotFoundException;
import com.matricula_universitaria.mapper.AuthRoleMapper;
import com.matricula_universitaria.repository.AuthPermissionRepository;
import com.matricula_universitaria.repository.AuthRolePermissionRepository;
import com.matricula_universitaria.repository.AuthRoleRepository;
import com.matricula_universitaria.service.AuthRoleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AuthRoleServiceImpl implements AuthRoleService {

    private final AuthRoleRepository roleRepository;
    private final AuthPermissionRepository permissionRepository;
    private final AuthRolePermissionRepository rolePermissionRepository;
    private final AuthRoleMapper roleMapper;

    public AuthRoleServiceImpl(AuthRoleRepository roleRepository,
                               AuthPermissionRepository permissionRepository,
                               AuthRolePermissionRepository rolePermissionRepository,
                               AuthRoleMapper roleMapper) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.roleMapper = roleMapper;
    }

    @Override
    public AuthRoleResponseDto crear(AuthRoleRequestDto request) {
        roleRepository.findByNombreIgnoreCase(request.nombre())
                .ifPresent(r -> { throw new BadRequestException("Ya existe un rol con nombre " + request.nombre()); });

        AuthRole entity = roleMapper.toEntity(request);
        AuthRole saved = roleRepository.save(entity);
        return roleMapper.toResponse(saved);
    }

    @Override
    public AuthRoleResponseDto actualizar(Long id, AuthRoleRequestDto request) {
        AuthRole entity = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con id " + id));

        if (!entity.getNombre().equalsIgnoreCase(request.nombre())) {
            roleRepository.findByNombreIgnoreCase(request.nombre())
                    .ifPresent(r -> { throw new BadRequestException("Ya existe un rol con nombre " + request.nombre()); });
        }

        roleMapper.updateEntity(request, entity);
        AuthRole updated = roleRepository.save(entity);
        return roleMapper.toResponse(updated);
    }

    @Override
    public void eliminar(Long id) {
        AuthRole entity = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con id " + id));
        roleRepository.delete(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthRoleResponseDto obtenerPorId(Long id) {
        AuthRole entity = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con id " + id));
        return roleMapper.toResponse(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuthRoleResponseDto> listarTodos() {
        return roleMapper.toResponseList(roleRepository.findAll());
    }

    @Override
    public AuthRoleResponseDto asignarPermiso(Long roleId, Long permissionId) {
        AuthRole role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con id " + roleId));
        AuthPermission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Permiso no encontrado con id " + permissionId));

        AuthRolePermissionId id = new AuthRolePermissionId(role.getId(), permission.getId());
        rolePermissionRepository.findById(id).ifPresent(rp -> {
            throw new BadRequestException("El rol ya tiene asignado ese permiso");
        });

        AuthRolePermission rp = AuthRolePermission.builder()
                .id(id)
                .role(role)
                .permission(permission)
                .build();
        rolePermissionRepository.save(rp);
        role.getRolePermissions().add(rp);

        return roleMapper.toResponse(role);
    }

    @Override
    public AuthRoleResponseDto removerPermiso(Long roleId, Long permissionId) {
        AuthRole role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con id " + roleId));
        AuthPermission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Permiso no encontrado con id " + permissionId));

        AuthRolePermissionId id = new AuthRolePermissionId(role.getId(), permission.getId());
        AuthRolePermission rp = rolePermissionRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("El rol no tiene asignado ese permiso"));

        rolePermissionRepository.delete(rp);
        role.getRolePermissions().remove(rp);

        return roleMapper.toResponse(role);
    }
}
