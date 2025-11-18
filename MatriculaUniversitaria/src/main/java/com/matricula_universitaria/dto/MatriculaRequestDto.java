package com.matricula_universitaria.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MatriculaRequestDto(
        @NotNull Long estudianteId,
        @NotNull Long seccionId,
        LocalDate fechaMatricula,
        @NotBlank @Size(max = 20) String estado,
        @NotNull @DecimalMin(value = "0.0", inclusive = true) BigDecimal costo,
        @Size(max = 50) String metodoPago
) {
}
