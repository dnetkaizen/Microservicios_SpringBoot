package com.kafka_event.service.impl;

import com.kafka_event.events.dto.UserCreatedEvent;
import com.kafka_event.events.dto.UserDeletedEvent;
import com.kafka_event.events.dto.UserUpdatedEvent;
import com.kafka_event.service.EventSyncService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EventSyncServiceImpl implements EventSyncService {

    @Override
    public void handleUserCreated(UserCreatedEvent event) {
        log.info("[SYNC] Processing UserCreatedEvent for userId={} - syncing with Auth-service (simulado)",
                event.getUserId());
    }

    @Override
    public void handleUserUpdated(UserUpdatedEvent event) {
        log.info("[SYNC] Processing UserUpdatedEvent for userId={} - syncing with Auth-service (simulado)",
                event.getUserId());
    }

    @Override
    public void handleUserDeleted(UserDeletedEvent event) {
        log.info("[SYNC] Processing UserDeletedEvent for userId={} - syncing with Auth-service (simulado)",
                event.getUserId());
    }
}
