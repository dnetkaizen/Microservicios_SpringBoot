package com.matricula_universitaria.events.producer;

import com.matricula_universitaria.events.KafkaTopics;
import com.matricula_universitaria.events.dto.UserUpdatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserUpdatedProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void send(UserUpdatedEvent event) {
        String key = event.getUserId() != null ? event.getUserId().toString() : null;
        log.info("[Kafka] The userUpdatedProducer sending UserUpdatedEvent to topic {}: {}", KafkaTopics.USER_UPDATED_TOPIC, event);
        kafkaTemplate.send(KafkaTopics.USER_UPDATED_TOPIC, key, event);
    }
}
