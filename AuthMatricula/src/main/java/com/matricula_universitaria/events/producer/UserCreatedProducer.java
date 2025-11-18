package com.matricula_universitaria.events.producer;

import com.matricula_universitaria.events.KafkaTopics;
import com.matricula_universitaria.events.dto.UserCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserCreatedProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void send(UserCreatedEvent event) {
        String key = event.getUserId() != null ? event.getUserId().toString() : null;
        log.info("[Kafka] Enviando UserCreatedEvent al tópico {}: {}", KafkaTopics.USER_CREATED_TOPIC, event);
        kafkaTemplate.send(KafkaTopics.USER_CREATED_TOPIC, key, event);
    }
}
