package com.matricula_universitaria.dto;

import java.time.LocalDateTime;
import java.util.Set;

public record AuthUserResponseDto(
        Long id,
        String username,
        String email,
        Boolean activo,
        LocalDateTime fechaRegistro,
        Set<String> roles
) {
}
