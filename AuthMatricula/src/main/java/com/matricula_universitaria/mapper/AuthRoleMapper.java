package com.matricula_universitaria.mapper;

import com.matricula_universitaria.dto.AuthRoleRequestDto;
import com.matricula_universitaria.dto.AuthRoleResponseDto;
import com.matricula_universitaria.entity.AuthPermission;
import com.matricula_universitaria.entity.AuthRole;
import com.matricula_universitaria.entity.AuthRolePermission;
import org.springframework.stereotype.Component;

import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class AuthRoleMapper {

    public AuthRole toEntity(AuthRoleRequestDto dto) {
        if (dto == null) {
            return null;
        }
        return AuthRole.builder()
                .nombre(dto.nombre())
                .descripcion(dto.descripcion())
                .build();
    }

    public void updateEntityFromDto(AuthRoleRequestDto dto, AuthRole entity) {
        if (dto == null || entity == null) {
            return;
        }
        entity.setNombre(dto.nombre());
        entity.setDescripcion(dto.descripcion());
    }

    public AuthRoleResponseDto toResponseDto(AuthRole role) {
        if (role == null) {
            return null;
        }

        Set<String> permissions = role.getRolePermissions()
                .stream()
                .map(AuthRolePermission::getPermission)
                .filter(Objects::nonNull)
                .map(AuthPermission::getNombre)
                .collect(Collectors.toSet());

        return new AuthRoleResponseDto(
            role.getId(),
            role.getNombre(),
            role.getDescripcion(),
            permissions
        );
    }
}
