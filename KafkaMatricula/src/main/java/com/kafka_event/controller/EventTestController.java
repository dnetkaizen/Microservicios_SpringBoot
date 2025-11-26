package com.kafka_event.controller;

import com.kafka_event.events.producer.UserCreatedProducer;
import com.kafka_event.events.producer.UserDeletedProducer;
import com.kafka_event.events.producer.UserUpdatedProducer;
import com.kafka_event.events.dto.UserCreatedEvent;
import com.kafka_event.events.dto.UserUpdatedEvent;
import com.kafka_event.events.dto.UserDeletedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Arrays;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class EventTestController {

    private final UserCreatedProducer userCreatedProducer;
    private final UserDeletedProducer userDeletedProducer;
    private final UserUpdatedProducer userUpdatedProducer;
    
    private final AtomicLong idCounter = new AtomicLong(1);

    @PostMapping("/user-created")
    public String testUserCreated() {
        UserCreatedEvent event = UserCreatedEvent.builder()
            .userId(idCounter.getAndIncrement())
            .username("testuser" + idCounter.get())
            .email("created" + idCounter.get() + "@example.com")
            .roles(Arrays.asList("USER", "CREATED"))
            .eventTimestamp(Instant.now())
            .build();
        
        userCreatedProducer.send(event);
        return "✅ Evento UserCreated enviado: " + event;
    }

    @PostMapping("/user-updated") 
    public String testUserUpdated() {
        UserUpdatedEvent event = UserUpdatedEvent.builder()
            .userId(idCounter.getAndIncrement())
            .username("testuser" + idCounter.get())
            .email("updated" + idCounter.get() + "@example.com")
            .roles(Arrays.asList("USER", "UPDATED"))
            .eventTimestamp(Instant.now())
            .build();
            
        userUpdatedProducer.send(event);
        return "✅ Evento UserUpdated enviado: " + event;
    }

    @PostMapping("/user-deleted")
    public String testUserDeleted() {
        UserDeletedEvent event = UserDeletedEvent.builder()
            .userId(idCounter.getAndIncrement())
            .username("testuser" + idCounter.get())
            .email("deleted" + idCounter.get() + "@example.com")
            .roles(Arrays.asList("USER", "DELETED"))
            .eventTimestamp(Instant.now())
            .build();
            
        userDeletedProducer.send(event);
        return "✅ Evento UserDeleted enviado: " + event;
    }
    
    @GetMapping("/health")
    public String health() {
        return "✅ KafkaMatricula funcionando - Usa POST /api/test/user-created para probar Kafka";
    }
}