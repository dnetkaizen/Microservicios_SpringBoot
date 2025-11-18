package com.rabbitmq.consumer;

import com.rabbitmq.config.RabbitMQConfig;
import com.rabbitmq.dto.MatriculaNotificationDTO;
import com.rabbitmq.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MatriculaNotificationConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = RabbitMQConfig.MATRICULA_QUEUE)
    public void receive(MatriculaNotificationDTO dto) {
        log.info("[RabbitMQ] Recibido MatriculaNotificationDTO: {}", dto);
        notificationService.handleMatriculaNotification(dto);
    }
}
