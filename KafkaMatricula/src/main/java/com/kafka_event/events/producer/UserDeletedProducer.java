package com.kafka_event.events.producer;

import com.kafka_event.config.KafkaTopicsConfig;
import com.kafka_event.events.dto.UserDeletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserDeletedProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void send(UserDeletedEvent event) {
        if (event == null) {
            throw new IllegalArgumentException("UserDeletedEvent must not be null");
        }
        if (event.getEventTimestamp() == null) {
            event.setEventTimestamp(Instant.now());
        }
        String key = event.getUserId() != null ? event.getUserId().toString() : null;
        log.info("Sending UserDeletedEvent to topic {}: {}", KafkaTopicsConfig.USER_DELETED_TOPIC, event);
        kafkaTemplate.send(KafkaTopicsConfig.USER_DELETED_TOPIC, key, event);
    }
}
