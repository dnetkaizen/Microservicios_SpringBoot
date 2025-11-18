package com.matricula_universitaria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthPermissionRequestDto(
        @NotBlank @Size(max = 100) String nombre,
        @Size(max = 200) String descripcion
) {
}
