package com.kafka_event.events.producer;

import com.kafka_event.config.KafkaTopicsConfig;
import com.kafka_event.events.dto.UserCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserCreatedProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void send(UserCreatedEvent event) {
        if (event == null) {
            throw new IllegalArgumentException("UserCreatedEvent must not be null");
        }
        if (event.getEventTimestamp() == null) {
            event.setEventTimestamp(Instant.now());
        }
        String key = event.getUserId() != null ? event.getUserId().toString() : null;
        
        log.info("🚀 ENVIANDO UserCreatedEvent a Kafka - Topic: {}", KafkaTopicsConfig.USER_CREATED_TOPIC);
        log.info("📦 Datos del evento: {}", event);
        
        // ✅ ENVÍO REAL A KAFKA - DESCOMENTA ESTA LÍNEA
        kafkaTemplate.send(KafkaTopicsConfig.USER_CREATED_TOPIC, key, event);
        
        System.out.println("✅ Evento REAL enviado a Kafka");
    }
}

