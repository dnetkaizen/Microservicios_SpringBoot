package com.rabbitmq.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatriculaNotificationDTO {

    @NotNull
    private Long estudianteId;

    @NotNull
    private Long seccionId;

    @NotNull
    private String estado;

    @NotNull
    @Email
    private String emailDestino;
}
