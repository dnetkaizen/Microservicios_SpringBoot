package com.rabbitmq.consumer;

import com.rabbitmq.config.RabbitMQConfig;
import com.rabbitmq.dto.PagoNotificationDTO;
import com.rabbitmq.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PagoNotificationConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = RabbitMQConfig.PAGO_QUEUE)
    public void receive(PagoNotificationDTO dto) {
        log.info("[RabbitMQ] Recibido PagoNotificationDTO: {}", dto);
        notificationService.handlePagoNotification(dto);
    }
}
