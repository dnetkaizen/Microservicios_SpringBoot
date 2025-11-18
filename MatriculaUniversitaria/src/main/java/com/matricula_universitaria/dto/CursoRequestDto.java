package com.matricula_universitaria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CursoRequestDto(
        @NotBlank @Size(max = 20) String codigo,
        @NotBlank @Size(max = 100) String nombre,
        String descripcion,
        @NotNull @Positive Integer creditos,
        @NotNull @Positive Integer nivelSemestre,
        Boolean activo
) {
}
