package com.matricula_universitaria.mapper;

import com.matricula_universitaria.dto.AuthUserRequestDto;
import com.matricula_universitaria.dto.AuthUserResponseDto;
import com.matricula_universitaria.entity.AuthUser;
import com.matricula_universitaria.entity.AuthUserRole;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class AuthUserMapper {

    public AuthUser toEntity(AuthUserRequestDto dto) {
        if (dto == null) return null;
        AuthUser entity = new AuthUser();
        entity.setUsername(dto.username());
        entity.setEmail(dto.email());
        entity.setActivo(dto.activo() != null ? dto.activo() : Boolean.TRUE);
        return entity;
    }

    public void updateEntity(AuthUserRequestDto dto, AuthUser entity) {
        entity.setUsername(dto.username());
        entity.setEmail(dto.email());
        if (dto.activo() != null) {
            entity.setActivo(dto.activo());
        }
    }

    public AuthUserResponseDto toResponse(AuthUser entity) {
        if (entity == null) return null;
        Set<String> roles = entity.getUserRoles().stream()
                .map(AuthUserRole::getRole)
                .map(r -> r.getNombre())
                .collect(Collectors.toSet());

        return new AuthUserResponseDto(
                entity.getId(),
                entity.getUsername(),
                entity.getEmail(),
                entity.getActivo(),
                entity.getFechaRegistro(),
                roles
        );
    }

    public List<AuthUserResponseDto> toResponseList(List<AuthUser> entities) {
        return entities.stream().map(this::toResponse).toList();
    }
}
