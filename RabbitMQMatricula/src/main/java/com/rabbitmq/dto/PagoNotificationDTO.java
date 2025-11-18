package com.rabbitmq.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagoNotificationDTO {

    @NotNull
    private Long pagoId;

    @NotNull
    private Long matriculaId;

    @NotNull
    private BigDecimal monto;

    @NotNull
    @Email
    private String emailDestino;
}
