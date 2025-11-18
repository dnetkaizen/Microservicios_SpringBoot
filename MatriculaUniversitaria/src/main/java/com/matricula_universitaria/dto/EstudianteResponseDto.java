package com.matricula_universitaria.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record EstudianteResponseDto(
        Long id,
        String nombre,
        String apellido,
        String dni,
        String email,
        String telefono,
        LocalDate fechaNacimiento,
        String direccion,
        LocalDateTime fechaRegistro,
        Boolean activo
) {
}
