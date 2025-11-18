package com.matricula_universitaria.dto;

import java.time.LocalDateTime;

public record CursoResponseDto(
        Long id,
        String codigo,
        String nombre,
        String descripcion,
        Integer creditos,
        Integer nivelSemestre,
        LocalDateTime fechaRegistro,
        Boolean activo
) {
}
