package com.kafka_event.events.producer;

import com.kafka_event.config.KafkaTopicsConfig;
import com.kafka_event.events.dto.UserUpdatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserUpdatedProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void send(UserUpdatedEvent event) {
        if (event == null) {
            throw new IllegalArgumentException("UserUpdatedEvent must not be null");
        }
        if (event.getEventTimestamp() == null) {
            event.setEventTimestamp(Instant.now());
        }
        String key = event.getUserId() != null ? event.getUserId().toString() : null;
        log.info("Sending UserUpdatedEvent to topic {}: {}", KafkaTopicsConfig.USER_UPDATED_TOPIC, event);
        kafkaTemplate.send(KafkaTopicsConfig.USER_UPDATED_TOPIC, key, event);
    }
}
