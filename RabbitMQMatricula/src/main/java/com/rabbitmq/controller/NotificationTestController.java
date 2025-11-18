package com.rabbitmq.controller;

import com.rabbitmq.dto.EmailNotificationDTO;
import com.rabbitmq.dto.MatriculaNotificationDTO;
import com.rabbitmq.dto.PagoNotificationDTO;
import com.rabbitmq.producer.EmailNotificationProducer;
import com.rabbitmq.producer.MatriculaNotificationProducer;
import com.rabbitmq.producer.PagoNotificationProducer;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationTestController {

    private final EmailNotificationProducer emailNotificationProducer;
    private final MatriculaNotificationProducer matriculaNotificationProducer;
    private final PagoNotificationProducer pagoNotificationProducer;

    @PostMapping("/email/test")
    public ResponseEntity<Void> sendEmailTest(@Valid @RequestBody EmailNotificationDTO dto) {
        log.info("[HTTP] Test email notification: {}", dto);
        emailNotificationProducer.send(dto);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/matricula/test")
    public ResponseEntity<Void> sendMatriculaTest(@Valid @RequestBody MatriculaNotificationDTO dto) {
        log.info("[HTTP] Test matricula notification: {}", dto);
        matriculaNotificationProducer.send(dto);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/pago/test")
    public ResponseEntity<Void> sendPagoTest(@Valid @RequestBody PagoNotificationDTO dto) {
        log.info("[HTTP] Test pago notification: {}", dto);
        pagoNotificationProducer.send(dto);
        return ResponseEntity.accepted().build();
    }
}
