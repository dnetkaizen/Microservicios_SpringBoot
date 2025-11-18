package com.rabbitmq.service;

import com.rabbitmq.dto.EmailNotificationDTO;
import com.rabbitmq.dto.MatriculaNotificationDTO;
import com.rabbitmq.dto.PagoNotificationDTO;

public interface NotificationService {

    void sendEmailNotification(EmailNotificationDTO dto);

    void handleMatriculaNotification(MatriculaNotificationDTO dto);

    void handlePagoNotification(PagoNotificationDTO dto);
}
