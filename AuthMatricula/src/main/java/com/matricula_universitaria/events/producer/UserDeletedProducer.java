package com.matricula_universitaria.events.producer;

import com.matricula_universitaria.events.KafkaTopics;
import com.matricula_universitaria.events.dto.UserDeletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserDeletedProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void send(UserDeletedEvent event) {
        String key = event.getUserId() != null ? event.getUserId().toString() : null;
        log.info("[Kafka] Enviando UserDeletedEvent al tópico {}: {}", KafkaTopics.USER_DELETED_TOPIC, event);
        kafkaTemplate.send(KafkaTopics.USER_DELETED_TOPIC, key, event);
    }
}
