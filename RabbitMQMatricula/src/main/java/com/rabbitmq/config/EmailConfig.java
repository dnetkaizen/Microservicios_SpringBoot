package com.rabbitmq.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class EmailConfig {
    // La configuración de JavaMailSender se toma de spring.mail.* en application.properties
    // Spring Boot auto-configura JavaMailSender con estas propiedades.
}
