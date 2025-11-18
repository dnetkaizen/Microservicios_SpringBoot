package com.matricula_universitaria.dto;

import java.util.Set;

public record AuthUserResponseDto(
        Long id,
        String username,
        String email,
        Boolean activo,
        Set<String> roles
) {
}
