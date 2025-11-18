package com.rabbitmq.producer;

import com.rabbitmq.config.RabbitMQConfig;
import com.rabbitmq.dto.PagoNotificationDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PagoNotificationProducer {

    private final RabbitTemplate rabbitTemplate;

    public void send(PagoNotificationDTO dto) {
        log.info("[RabbitMQ] Enviando PagoNotificationDTO a exchange {} con routingKey {}: {}",
                RabbitMQConfig.NOTIFICATIONS_EXCHANGE, RabbitMQConfig.PAGO_ROUTING_KEY, dto);
        rabbitTemplate.convertAndSend(RabbitMQConfig.NOTIFICATIONS_EXCHANGE, RabbitMQConfig.PAGO_ROUTING_KEY, dto);
    }
}
