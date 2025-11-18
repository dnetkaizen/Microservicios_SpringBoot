package com.kafka_event.events.consumer;

import com.kafka_event.config.KafkaTopicsConfig;
import com.kafka_event.events.dto.UserCreatedEvent;
import com.kafka_event.exceptions.KafkaProcessingException;
import com.kafka_event.service.EventSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserCreatedConsumer {

    private final EventSyncService eventSyncService;

    @KafkaListener(
            topics = KafkaTopicsConfig.USER_CREATED_TOPIC,
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "userCreatedKafkaListenerContainerFactory"
    )
    public void consume(UserCreatedEvent event) {
        log.info("Received UserCreatedEvent: {}", event);
        if (event == null || event.getUserId() == null) {
            throw new KafkaProcessingException("Invalid UserCreatedEvent: userId is null");
        }
        try {
            eventSyncService.handleUserCreated(event);
        } catch (Exception ex) {
            log.error("Error processing UserCreatedEvent: {}", event, ex);
            throw new KafkaProcessingException("Error processing UserCreatedEvent", ex);
        }
    }
}
