package com.matricula_universitaria.dto;

import java.time.LocalDateTime;

public record ProfesorResponseDto(
        Long id,
        String nombre,
        String apellido,
        String dni,
        String email,
        String telefono,
        String especialidad,
        String tituloAcademico,
        LocalDateTime fechaRegistro,
        Boolean activo
) {
}
