# Etapa de construcción
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app

COPY pom.xml .
RUN mvn -q -e -DskipTests dependency:go-offline

COPY src ./src
RUN mvn -q -DskipTests package

# Etapa de ejecución
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=builder /app/target/RabbitMQMatricula-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8089

ENTRYPOINT ["java","-jar","/app/app.jar"]
