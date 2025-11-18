package com.matricula_universitaria.mapper;

import com.matricula_universitaria.dto.AuthPermissionRequestDto;
import com.matricula_universitaria.dto.AuthPermissionResponseDto;
import com.matricula_universitaria.entity.AuthPermission;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AuthPermissionMapper {

    public AuthPermission toEntity(AuthPermissionRequestDto dto) {
        if (dto == null) return null;
        AuthPermission entity = new AuthPermission();
        entity.setNombre(dto.nombre());
        entity.setDescripcion(dto.descripcion());
        return entity;
    }

    public void updateEntity(AuthPermissionRequestDto dto, AuthPermission entity) {
        entity.setNombre(dto.nombre());
        entity.setDescripcion(dto.descripcion());
    }

    public AuthPermissionResponseDto toResponse(AuthPermission entity) {
        if (entity == null) return null;
        return new AuthPermissionResponseDto(
                entity.getId(),
                entity.getNombre(),
                entity.getDescripcion()
        );
    }

    public List<AuthPermissionResponseDto> toResponseList(List<AuthPermission> entities) {
        return entities.stream().map(this::toResponse).toList();
    }
}
