package com.matricula_universitaria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record SeccionRequestDto(
        @NotNull Long cursoId,
        @NotNull Long profesorId,
        @NotBlank @Size(max = 20) String codigo,
        @NotNull @Positive Integer capacidadMaxima,
        @Size(max = 50) String aula,
        @Size(max = 50) String horario,
        @Size(max = 50) String dias,
        @NotBlank @Size(max = 20) String periodoAcademico,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        Boolean activo
) {
}
