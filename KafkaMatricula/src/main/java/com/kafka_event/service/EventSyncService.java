package com.kafka_event.service;

import com.kafka_event.events.dto.UserCreatedEvent;
import com.kafka_event.events.dto.UserDeletedEvent;
import com.kafka_event.events.dto.UserUpdatedEvent;

public interface EventSyncService {

    void handleUserCreated(UserCreatedEvent event);

    void handleUserUpdated(UserUpdatedEvent event);

    void handleUserDeleted(UserDeletedEvent event);
}
