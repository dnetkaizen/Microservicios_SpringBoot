package com.matricula_universitaria.mapper;

import com.matricula_universitaria.dto.AuthRoleRequestDto;
import com.matricula_universitaria.dto.AuthRoleResponseDto;
import com.matricula_universitaria.entity.AuthRole;
import com.matricula_universitaria.entity.AuthRolePermission;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class AuthRoleMapper {

    public AuthRole toEntity(AuthRoleRequestDto dto) {
        if (dto == null) return null;
        AuthRole entity = new AuthRole();
        entity.setNombre(dto.nombre());
        entity.setDescripcion(dto.descripcion());
        return entity;
    }

    public void updateEntity(AuthRoleRequestDto dto, AuthRole entity) {
        entity.setNombre(dto.nombre());
        entity.setDescripcion(dto.descripcion());
    }

    public AuthRoleResponseDto toResponse(AuthRole entity) {
        if (entity == null) return null;
        Set<String> permisos = entity.getRolePermissions().stream()
                .map(AuthRolePermission::getPermission)
                .map(p -> p.getNombre())
                .collect(Collectors.toSet());

        return new AuthRoleResponseDto(
            entity.getId(),
            entity.getNombre(),
            entity.getDescripcion(),
            permisos
        );
    }

    public List<AuthRoleResponseDto> toResponseList(List<AuthRole> entities) {
        return entities.stream().map(this::toResponse).toList();
    }
}
