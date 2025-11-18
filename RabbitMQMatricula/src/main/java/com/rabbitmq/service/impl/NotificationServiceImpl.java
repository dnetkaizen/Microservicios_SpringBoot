package com.rabbitmq.service.impl;

import com.rabbitmq.dto.EmailNotificationDTO;
import com.rabbitmq.dto.MatriculaNotificationDTO;
import com.rabbitmq.dto.PagoNotificationDTO;
import com.rabbitmq.email.EmailTemplateBuilder;
import com.rabbitmq.exceptions.NotificationException;
import com.rabbitmq.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final JavaMailSender mailSender;
    private final EmailTemplateBuilder emailTemplateBuilder;

    private static final String FROM_EMAIL = "no-reply@notification-service.local";

    @Override
    public void sendEmailNotification(EmailNotificationDTO dto) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(dto.getTo());
        message.setSubject(dto.getSubject());
        message.setText(dto.getMessage());
        message.setFrom(FROM_EMAIL);
        try {
            mailSender.send(message);
            log.info("Email enviado a {} con asunto '{}'", dto.getTo(), dto.getSubject());
        } catch (MailException ex) {
            log.error("Error enviando email a {}", dto.getTo(), ex);
            throw new NotificationException("Error enviando correo electrónico", ex);
        }
    }

    @Override
    public void handleMatriculaNotification(MatriculaNotificationDTO dto) {
        String subject = emailTemplateBuilder.buildMatriculaSubject(dto);
        String body = emailTemplateBuilder.buildMatriculaBody(dto);
        EmailNotificationDTO emailDto = EmailNotificationDTO.builder()
                .to(dto.getEmailDestino())
                .subject(subject)
                .message(body)
                .build();
        sendEmailNotification(emailDto);
    }

    @Override
    public void handlePagoNotification(PagoNotificationDTO dto) {
        String subject = emailTemplateBuilder.buildPagoSubject(dto);
        String body = emailTemplateBuilder.buildPagoBody(dto);
        EmailNotificationDTO emailDto = EmailNotificationDTO.builder()
                .to(dto.getEmailDestino())
                .subject(subject)
                .message(body)
                .build();
        sendEmailNotification(emailDto);
    }
}
