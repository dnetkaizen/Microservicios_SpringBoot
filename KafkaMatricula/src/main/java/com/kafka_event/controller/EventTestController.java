package com.kafka_event.controller;

import com.kafka_event.events.dto.UserCreatedEvent;
import com.kafka_event.events.dto.UserDeletedEvent;
import com.kafka_event.events.dto.UserUpdatedEvent;
import com.kafka_event.events.producer.UserCreatedProducer;
import com.kafka_event.events.producer.UserDeletedProducer;
import com.kafka_event.events.producer.UserUpdatedProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@Slf4j
@RestController
@RequestMapping("/api/events/test")
@RequiredArgsConstructor
public class EventTestController {

    private final UserCreatedProducer userCreatedProducer;
    private final UserUpdatedProducer userUpdatedProducer;
    private final UserDeletedProducer userDeletedProducer;

    @PostMapping("/create")
    public ResponseEntity<Void> testCreate(@RequestBody UserCreatedEvent event) {
        event.setEventTimestamp(Instant.now());
        log.info("[TEST] Sending test UserCreatedEvent: {}", event);
        userCreatedProducer.send(event);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/update")
    public ResponseEntity<Void> testUpdate(@RequestBody UserUpdatedEvent event) {
        event.setEventTimestamp(Instant.now());
        log.info("[TEST] Sending test UserUpdatedEvent: {}", event);
        userUpdatedProducer.send(event);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/delete")
    public ResponseEntity<Void> testDelete(@RequestBody UserDeletedEvent event) {
        event.setEventTimestamp(Instant.now());
        log.info("[TEST] Sending test UserDeletedEvent: {}", event);
        userDeletedProducer.send(event);
        return ResponseEntity.accepted().build();
    }
}
