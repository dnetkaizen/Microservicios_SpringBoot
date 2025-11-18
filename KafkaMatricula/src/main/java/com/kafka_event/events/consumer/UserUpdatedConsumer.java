package com.kafka_event.events.consumer;

import com.kafka_event.config.KafkaTopicsConfig;
import com.kafka_event.events.dto.UserUpdatedEvent;
import com.kafka_event.exceptions.KafkaProcessingException;
import com.kafka_event.service.EventSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserUpdatedConsumer {

    private final EventSyncService eventSyncService;

    @KafkaListener(
            topics = KafkaTopicsConfig.USER_UPDATED_TOPIC,
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "userUpdatedKafkaListenerContainerFactory"
    )
    public void consume(UserUpdatedEvent event) {
        log.info("Received UserUpdatedEvent: {}", event);
        if (event == null || event.getUserId() == null) {
            throw new KafkaProcessingException("Invalid UserUpdatedEvent: userId is null");
        }
        try {
            eventSyncService.handleUserUpdated(event);
        } catch (Exception ex) {
            log.error("Error processing UserUpdatedEvent: {}", event, ex);
            throw new KafkaProcessingException("Error processing UserUpdatedEvent", ex);
        }
    }
}
