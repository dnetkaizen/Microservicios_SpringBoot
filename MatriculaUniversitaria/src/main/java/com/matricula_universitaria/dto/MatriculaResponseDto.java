package com.matricula_universitaria.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record MatriculaResponseDto(
        Long id,
        Long estudianteId,
        String estudianteNombreCompleto,
        Long seccionId,
        String seccionCodigo,
        String cursoCodigo,
        LocalDate fechaMatricula,
        String estado,
        BigDecimal costo,
        String metodoPago,
        LocalDateTime fechaRegistro
) {
}
