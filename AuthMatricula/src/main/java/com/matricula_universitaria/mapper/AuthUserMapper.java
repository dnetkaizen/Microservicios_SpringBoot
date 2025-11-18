package com.matricula_universitaria.mapper;

import com.matricula_universitaria.dto.AuthUserRequestDto;
import com.matricula_universitaria.dto.AuthUserResponseDto;
import com.matricula_universitaria.entity.AuthRole;
import com.matricula_universitaria.entity.AuthUser;
import com.matricula_universitaria.entity.AuthUserRole;
import org.springframework.stereotype.Component;

import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class AuthUserMapper {

    public AuthUser toEntity(AuthUserRequestDto dto) {
        if (dto == null) {
            return null;
        }
        return AuthUser.builder()
                .username(dto.username())
                .email(dto.email())
                .password(dto.password())
                .activo(dto.activo())
                .build();
    }

    public void updateEntityFromDto(AuthUserRequestDto dto, AuthUser entity) {
        if (dto == null || entity == null) {
            return;
        }
        entity.setUsername(dto.username());
        entity.setEmail(dto.email());
        entity.setActivo(dto.activo());
    }

    public AuthUserResponseDto toResponseDto(AuthUser user) {
        if (user == null) {
            return null;
        }

        Set<String> roles = user.getUserRoles()
                .stream()
                .map(AuthUserRole::getRole)
                .filter(Objects::nonNull)
                .map(AuthRole::getNombre)
                .collect(Collectors.toSet());

        return new AuthUserResponseDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getActivo(),
                roles
        );
    }
}
