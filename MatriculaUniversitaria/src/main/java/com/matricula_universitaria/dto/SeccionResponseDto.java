package com.matricula_universitaria.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record SeccionResponseDto(
        Long id,
        Long cursoId,
        String cursoCodigo,
        String cursoNombre,
        Long profesorId,
        String profesorNombreCompleto,
        String codigo,
        Integer capacidadMaxima,
        String aula,
        String horario,
        String dias,
        String periodoAcademico,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        LocalDateTime fechaRegistro,
        Boolean activo
) {
}
