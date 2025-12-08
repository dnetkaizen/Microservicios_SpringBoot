package com.matricula_universitaria.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.credentials.file:}")
    private String firebaseCredentialsFile;

    @Value("${firebase.project-id:}")
    private String firebaseProjectId;

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        if (!FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.getInstance();
        }

        if (firebaseCredentialsFile == null || firebaseCredentialsFile.isBlank()) {
            throw new IllegalStateException("La propiedad firebase.credentials.file no está configurada");
        }

        try (InputStream serviceAccount = new FileInputStream(firebaseCredentialsFile)) {
            FirebaseOptions.Builder optionsBuilder = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount));

            if (firebaseProjectId != null && !firebaseProjectId.isBlank()) {
                optionsBuilder.setProjectId(firebaseProjectId);
            }

            return FirebaseApp.initializeApp(optionsBuilder.build());
        }
    }

    @Bean
    public FirebaseAuth firebaseAuth(FirebaseApp firebaseApp) {
        return FirebaseAuth.getInstance(firebaseApp);
    }
}
