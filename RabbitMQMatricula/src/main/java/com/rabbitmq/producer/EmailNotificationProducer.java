package com.rabbitmq.producer;

import com.rabbitmq.config.RabbitMQConfig;
import com.rabbitmq.dto.EmailNotificationDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailNotificationProducer {

    private final RabbitTemplate rabbitTemplate;

    public void send(EmailNotificationDTO dto) {
        log.info("[RabbitMQ] Enviando EmailNotificationDTO a exchange {} con routingKey {}: {}",
                RabbitMQConfig.NOTIFICATIONS_EXCHANGE, RabbitMQConfig.EMAIL_ROUTING_KEY, dto);
        rabbitTemplate.convertAndSend(RabbitMQConfig.NOTIFICATIONS_EXCHANGE, RabbitMQConfig.EMAIL_ROUTING_KEY, dto);
    }
}
