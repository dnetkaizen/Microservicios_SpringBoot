package com.rabbitmq.email;

import com.rabbitmq.dto.MatriculaNotificationDTO;
import com.rabbitmq.dto.PagoNotificationDTO;
import org.springframework.stereotype.Component;

@Component
public class EmailTemplateBuilder {

    public String buildMatriculaSubject(MatriculaNotificationDTO dto) {
        return "Estado de matrícula: " + dto.getEstado();
    }

    public String buildMatriculaBody(MatriculaNotificationDTO dto) {
        return "Estimado estudiante " + dto.getEstudianteId() + "\n" +
                "Su matrícula en la sección " + dto.getSeccionId() + " ha cambiado de estado a: " + dto.getEstado() + ".";
    }

    public String buildPagoSubject(PagoNotificationDTO dto) {
        return "Confirmación de pago #" + dto.getPagoId();
    }

    public String buildPagoBody(PagoNotificationDTO dto) {
        return "Estimado usuario,\n" +
                "Hemos recibido su pago por el monto de " + dto.getMonto() + 
                " asociado a la matrícula " + dto.getMatriculaId() + ".";
    }
}
