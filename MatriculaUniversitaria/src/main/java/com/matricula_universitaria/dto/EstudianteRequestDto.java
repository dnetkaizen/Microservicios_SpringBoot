package com.matricula_universitaria.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record EstudianteRequestDto(
        @NotBlank @Size(max = 50) String nombre,
        @NotBlank @Size(max = 50) String apellido,
        @NotBlank @Size(max = 20) String dni,
        @NotBlank @Email @Size(max = 100) String email,
        @Size(max = 20) String telefono,
        @NotNull LocalDate fechaNacimiento,
        @Size(max = 200) String direccion,
        Boolean activo
) {
}
