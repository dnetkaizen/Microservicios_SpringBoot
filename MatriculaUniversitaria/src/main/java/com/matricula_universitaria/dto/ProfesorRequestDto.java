package com.matricula_universitaria.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProfesorRequestDto(
        @NotBlank @Size(max = 50) String nombre,
        @NotBlank @Size(max = 50) String apellido,
        @NotBlank @Size(max = 20) String dni,
        @NotBlank @Email @Size(max = 100) String email,
        @Size(max = 20) String telefono,
        @Size(max = 100) String especialidad,
        @Size(max = 100) String tituloAcademico,
        Boolean activo
) {
}
