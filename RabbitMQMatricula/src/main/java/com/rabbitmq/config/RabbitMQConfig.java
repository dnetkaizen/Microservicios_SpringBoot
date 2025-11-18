package com.rabbitmq.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String NOTIFICATIONS_EXCHANGE = "notifications.exchange";

    public static final String EMAIL_QUEUE = "notifications.email";
    public static final String MATRICULA_QUEUE = "notifications.matricula";
    public static final String PAGO_QUEUE = "notifications.pago";

    public static final String EMAIL_ROUTING_KEY = "email.send";
    public static final String MATRICULA_ROUTING_KEY = "matricula.created";
    public static final String PAGO_ROUTING_KEY = "pago.completed";

    @Bean
    public TopicExchange notificationsExchange() {
        return new TopicExchange(NOTIFICATIONS_EXCHANGE);
    }

    @Bean
    public Queue emailQueue() {
        return QueueBuilder.durable(EMAIL_QUEUE).build();
    }

    @Bean
    public Queue matriculaQueue() {
        return QueueBuilder.durable(MATRICULA_QUEUE).build();
    }

    @Bean
    public Queue pagoQueue() {
        return QueueBuilder.durable(PAGO_QUEUE).build();
    }

    @Bean
    public Binding emailBinding(TopicExchange notificationsExchange, Queue emailQueue) {
        return BindingBuilder.bind(emailQueue)
                .to(notificationsExchange)
                .with(EMAIL_ROUTING_KEY);
    }

    @Bean
    public Binding matriculaBinding(TopicExchange notificationsExchange, Queue matriculaQueue) {
        return BindingBuilder.bind(matriculaQueue)
                .to(notificationsExchange)
                .with(MATRICULA_ROUTING_KEY);
    }

    @Bean
    public Binding pagoBinding(TopicExchange notificationsExchange, Queue pagoQueue) {
        return BindingBuilder.bind(pagoQueue)
                .to(notificationsExchange)
                .with(PAGO_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter messageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter);
        template.setExchange(NOTIFICATIONS_EXCHANGE);
        return template;
    }
}
