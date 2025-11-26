package com.kafka_event;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class KafkaMatriculaApplication {

    public static void main(String[] args) {
        SpringApplication.run(KafkaMatriculaApplication.class, args);
    }

    // ✅ ELIMINA o COMENTA el CommandLineRunner - está cerrando la aplicación
    /*
    @Bean
    public CommandLineRunner testKafka(UserCreatedProducer userCreatedProducer) {
        return args -> {
            System.out.println("🚀 Probando Kafka...");
            
            UserCreatedEvent event = UserCreatedEvent.builder()
                .userId(1L)
                .username("testuser")
                .email("test@example.com")
                .roles(Arrays.asList("USER", "TEST"))
                .eventTimestamp(Instant.now())
                .build();
                
            userCreatedProducer.send(event);
            System.out.println("✅ Evento de prueba enviado a Kafka");
        };
    }
    */
}