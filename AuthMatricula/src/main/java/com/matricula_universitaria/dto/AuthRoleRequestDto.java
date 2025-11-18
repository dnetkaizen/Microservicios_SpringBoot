package com.matricula_universitaria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthRoleRequestDto(
        @NotBlank @Size(max = 50) String nombre,
        @Size(max = 200) String descripcion
) {
}
