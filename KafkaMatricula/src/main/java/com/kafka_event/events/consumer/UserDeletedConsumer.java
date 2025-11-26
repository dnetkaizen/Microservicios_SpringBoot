package com.kafka_event.events.consumer;

import com.kafka_event.config.KafkaTopicsConfig;
import com.kafka_event.events.dto.UserDeletedEvent;
import com.kafka_event.exceptions.KafkaProcessingException;
import com.kafka_event.service.EventSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserDeletedConsumer {

    private final EventSyncService eventSyncService;

    
    @KafkaListener(
            topics = KafkaTopicsConfig.USER_DELETED_TOPIC,
            groupId = "${spring.kafka.consumer.group-id}"
         //   containerFactory = "userDeletedKafkaListenerContainerFactory"
    )
            
    public void consume(UserDeletedEvent event) {
        log.info("Received UserDeletedEvent: {}", event);
        if (event == null || event.getUserId() == null) {
            throw new KafkaProcessingException("Invalid UserDeletedEvent: userId is null");
        }
        try {
            eventSyncService.handleUserDeleted(event);
        } catch (Exception ex) {
            log.error("Error processing UserDeletedEvent: {}", event, ex);
            throw new KafkaProcessingException("Error processing UserDeletedEvent", ex);
        }
    }
}
