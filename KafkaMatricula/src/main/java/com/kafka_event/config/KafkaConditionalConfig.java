package com.kafka_event.config;
/* 
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import java.util.concurrent.CompletableFuture;

@Configuration
@ConditionalOnProperty(name = "spring.kafka.enabled", havingValue = "false", matchIfMissing = true)
public class KafkaConditionalConfig {

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<String, Object>(null) {
            @Override
            public CompletableFuture<SendResult<String, Object>> send(String topic, Object data) {
                System.out.println("⚠️  Kafka desactivado - Simulando envío a topic: " + topic);
                return CompletableFuture.completedFuture(null);
            }
            
            @Override
            public CompletableFuture<SendResult<String, Object>> send(String topic, String key, Object data) {
                System.out.println("⚠️  Kafka desactivado - Simulando envío a topic: " + topic + ", key: " + key);
                return CompletableFuture.completedFuture(null);
            }
            
            @Override
            public CompletableFuture<SendResult<String, Object>> send(String topic, Integer partition, String key, Object data) {
                System.out.println("⚠️  Kafka desactivado - Simulando envío a topic: " + topic + ", partition: " + partition + ", key: " + key);
                return CompletableFuture.completedFuture(null);
            }
            
            @Override
            public CompletableFuture<SendResult<String, Object>> send(String topic, Integer partition, Long timestamp, String key, Object data) {
                System.out.println("⚠️  Kafka desactivado - Simulando envío a topic: " + topic + ", partition: " + partition + ", timestamp: " + timestamp + ", key: " + key);
                return CompletableFuture.completedFuture(null);
            }
        };
    }
}
    */