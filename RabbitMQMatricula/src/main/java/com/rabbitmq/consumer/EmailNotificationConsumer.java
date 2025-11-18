package com.rabbitmq.consumer;

import com.rabbitmq.config.RabbitMQConfig;
import com.rabbitmq.dto.EmailNotificationDTO;
import com.rabbitmq.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailNotificationConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = RabbitMQConfig.EMAIL_QUEUE)
    public void receive(EmailNotificationDTO dto) {
        log.info("[RabbitMQ] Recibido EmailNotificationDTO: {}", dto);
        notificationService.sendEmailNotification(dto);
    }
}
