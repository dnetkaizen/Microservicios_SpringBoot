package com.matricula_universitaria.mapper;

import com.matricula_universitaria.dto.AuthPermissionRequestDto;
import com.matricula_universitaria.dto.AuthPermissionResponseDto;
import com.matricula_universitaria.entity.AuthPermission;
import org.springframework.stereotype.Component;

@Component
public class AuthPermissionMapper {

    public AuthPermission toEntity(AuthPermissionRequestDto dto) {
        if (dto == null) {
            return null;
        }
        return AuthPermission.builder()
                .nombre(dto.nombre())
                .descripcion(dto.descripcion())
                .build();
    }

    public void updateEntityFromDto(AuthPermissionRequestDto dto, AuthPermission entity) {
        if (dto == null || entity == null) {
            return;
        }
        entity.setNombre(dto.nombre());
        entity.setDescripcion(dto.descripcion());
    }

    public AuthPermissionResponseDto toResponseDto(AuthPermission permission) {
        if (permission == null) {
            return null;
        }
        return new AuthPermissionResponseDto(
                permission.getId(),
                permission.getNombre(),
                permission.getDescripcion()
        );
    }
}
