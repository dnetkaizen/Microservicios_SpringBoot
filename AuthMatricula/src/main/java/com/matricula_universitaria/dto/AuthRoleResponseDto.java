package com.matricula_universitaria.dto;

import java.util.Set;

public record AuthRoleResponseDto(
        Long id,
        String nombre,
        String descripcion,
        Set<String> permissions
) {
}
