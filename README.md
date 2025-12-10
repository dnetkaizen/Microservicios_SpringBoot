# Plataforma de Matrícula Universitaria – Arquitectura Microservicios

## 1. Introducción y visión general

- **Descripción general del proyecto**  
  La *Plataforma de Matrícula Universitaria* es un ecosistema backend compuesto por múltiples microservicios independientes que gestionan autenticación, matrícula, eventos de integración y notificaciones por correo electrónico. El objetivo es ofrecer una arquitectura moderna, escalable y orientada a eventos para cubrir el ciclo completo de matrícula universitaria.

- **Tecnologías principales**
  - Java 21 (compatible con JDK 17+)
  - Spring Boot 3.x (Web, Data JPA, Validation, Security, Actuator)
  - Spring Security + JWT (servicio de Auth)
  - Apache Kafka (eventos de usuario)
  - RabbitMQ (mensajería de notificaciones)
  - PostgreSQL (persistencia)
  - Docker & Docker Compose
  - Mailtrap (entorno de pruebas de email)
  - JPA / Hibernate
  - Lombok

- **Objetivo del ecosistema**
  - **Centralizar** autenticación y autorización de usuarios.
  - **Gestionar** el proceso de matrícula universitaria y sus entidades asociadas.
  - **Sincronizar** cambios de usuarios vía eventos Kafka (event-driven).
  - **Notificar** vía correo electrónico usando RabbitMQ + Mailtrap.
  - **Facilitar** despliegue reproducible con Docker Compose.

- **Público objetivo**
  - Desarrolladores backend que clonan este repositorio para:
    - Ejecutar el ecosistema localmente.
    - Extender la funcionalidad (nuevos eventos, nuevos microservicios).
    - Integrarlo con otros sistemas (frontends, ERPs académicos, etc.).

- **Por qué microservicios**
  - **Escalabilidad independiente**: Auth, eventos y notificaciones pueden escalarse de forma aislada.
  - **Aislamiento de fallos**: un problema en notificaciones no derriba la autenticación.
  - **Tecnologías especializadas**: cada servicio usa sólo lo que necesita (Kafka, RabbitMQ, etc.).
  - **Evolución independiente**: se pueden desplegar nuevas versiones de un microservicio sin afectar al resto.

---

## 2. Arquitectura general

### 2.1 Diagrama ASCII de alto nivel

```text
                            ┌──────────────────────────────────────┐
                            │           CLIENTES / FRONTEND        │
                            └──────────────────────────────────────┘
                                           │
                     HTTP                  │
          (REST JSON, puertos 8086–8089)   │
                                           ▼

                ┌───────────────────────────────────────────────┐
                │          BACKEND MATRÍCULA (8086)             │
                │     (MatriculaUniversitaria - REST API)       │
                └───────────────┬───────────────────────────────┘
                                │
                                │ Orquesta operaciones de negocio
                                │ y delega en otros servicios
                                │
                ┌───────────────┴───────────────────────────────┐
                │                                               │
                ▼                                               ▼

     ┌─────────────────────────────┐                  ┌──────────────────────────────┐
     │       AUTH SERVICE          │                  │   KAFKA EVENT SERVICE        │
     │ (AuthMatricula - 8087)      │                  │ (KafkaMatricula - 8088)      │
     └───────────┬─────────────────┘                  └───────────┬──────────────────┘
                 │                                   Kafka        │
                 │  Eventos de usuario (user.*)    topics        │
                 └───────────────────────────────────────────────┘

                ┌───────────────────────────────────────────────┐
                │      NOTIFICATION SERVICE (8089)              │
                │   (RabbitMQMatricula - Email + RabbitMQ)      │
                └───────────────┬───────────────────────────────┘
                                │
                                │ RabbitMQ (colas notifications.*)
                                │
                                ▼
                       ┌─────────────────┐
                       │   RABBITMQ      │
                       │ (broker 5672)   │
                       └─────────────────┘

```

Flujos específicos de interés:

```text
[Flujo de usuarios]

CLIENTE
  └─(HTTP)→ BACKEND MATRÍCULA (8086)
             └─(HTTP)→ AUTH SERVICE (8087)
                        └─(eventos)→ Kafka (user.created/updated/deleted)
                                      └→ KAFKA EVENT SERVICE (8088) [sync simulado]

[Flujo de notificaciones]

CLIENTE
  └─(HTTP)→ BACKEND MATRÍCULA (8086)
             └─(RabbitMQ msg)→ RabbitMQ
                                └→ NOTIFICATION SERVICE (8089)
                                      └→ Mailtrap (Email de prueba)
```

### 2.2 Descripción de cada microservicio y comunicación

- **Backend Matrícula (MatriculaUniversitaria)**
  - Expone APIs de dominio académico: estudiantes, secciones, matrículas, etc.
  - Actúa como *backend principal* al que se conectan clientes/frontends.
  - Orquesta llamadas a otros servicios (Auth, notificaciones, etc.).

- **Auth Service (AuthMatricula)**
  - Gestiona usuarios, roles y permisos.
  - Expone endpoints de registro/login y CRUD de usuarios/roles/permisos.
  - Emite eventos a Kafka cuando se crean/actualizan/eliminan usuarios.
  - Usa JWT para autenticación.

- **Kafka Event Service (KafkaMatricula)**
  - Consume eventos Kafka (`user.created`, `user.updated`, `user.deleted`).
  - Simula la sincronización de datos de usuarios hacia otros sistemas (logs de “sync”).
  - Es un consumidor independiente de los eventos de Auth.

- **Notification Service (RabbitMQMatricula)**
  - Consume mensajes de RabbitMQ relacionados con notificaciones (matrículas, pagos, emails directos).
  - Construye plantillas de correo y envía emails usando Mailtrap.

### 2.3 Kafka vs RabbitMQ en este ecosistema

- **Kafka**
  - Usado para **eventos de usuario** (user lifecycle).
  - Orientado a *event streaming* y procesamiento histórico de eventos.
  - Topics:
    - `user.created`
    - `user.updated`
    - `user.deleted`

- **RabbitMQ**
  - Usado para **notificaciones** puntuales (correos de matrícula, pagos, etc.).
  - Modelo *message broker* clásico (colas, exchange, routing keys).
  - Exchange y colas:
    - Exchange: `notifications.exchange`
    - Colas: `notifications.email`, `notifications.matricula`, `notifications.pago`

---

## 3. Lista de microservicios

> Nombres de carpetas del repositorio entre paréntesis.

- **1. Backend Matrícula – MatriculaUniversitaria**
  - **Puerto**: `8086`
  - **Responsabilidad**:
    - Gestionar el dominio de matrícula universitaria.
    - Exponer APIs REST para estudiantes, secciones, matrículas, etc.
    - Orquestar llamadas a Auth y Notificación.
  - **Base de datos**:
    - PostgreSQL (`postgres-backend`) – BD `matricula_db`
  - **Tecnologías**:
    - Spring Boot (Web, Data JPA, Validation)
    - PostgreSQL
    - Lombok

- **2. Auth Service – AuthMatricula**
  - **Puerto**: `8087`
  - **Responsabilidad**:
    - Gestión de usuarios, roles y permisos.
    - Autenticación y emisión de JWT.
    - Emisión de eventos Kafka de cambios en usuarios.
  - **Base de datos**:
    - PostgreSQL (`postgres-auth`) – BD `auth_db`
  - **Tecnologías**:
    - Spring Boot (Web, Data JPA, Security, Validation, Actuator)
    - Spring Security + JWT
    - Spring Kafka
    - PostgreSQL
    - Lombok

- **3. Kafka Event Service – KafkaMatricula**
  - **Puerto**: `8088`
  - **Responsabilidad**:
    - Consumir eventos de usuario desde Kafka.
    - Simular sincronización de datos con otros sistemas (logs).
  - **Base de datos**:
    - Puede no usar BD propia en esta versión (enfoque en consumo de eventos).
  - **Tecnologías**:
    - Spring Boot (Web, Actuator)
    - Spring Kafka
    - Lombok

- **4. Notification Service – RabbitMQMatricula**
  - **Puerto**: `8089`
  - **Responsabilidad**:
    - Consumir mensajes de RabbitMQ (matrículas, pagos, emails).
    - Construir correos y enviarlos vía Mailtrap.
  - **Base de datos**:
    - No requiere BD propia (stateless, orientado a mensajería).
  - **Tecnologías**:
    - Spring Boot (Web, Actuator, Validation)
    - Spring AMQP (RabbitMQ)
    - Spring Mail (JavaMailSender)
    - Mailtrap

---

## 4. Flujo de eventos completo (Usuarios: Auth ↔ Kafka)

### 4.1 Descripción paso a paso

- **Paso 1 – Creación/actualización de usuario**
  - Un cliente realiza una operación de gestión de usuario a través del backend:
    - Alta de usuario.
    - Actualización de datos.
    - Asignación/eliminación de roles.
  - El backend orquesta estos cambios contra el **Auth Service**.

- **Paso 2 – Persistencia en Auth**
  - Auth Service persiste el usuario/roles en `auth_db`.

- **Paso 3 – Publicación de eventos en Kafka**
  - Auth Service emite eventos a Kafka en los topics:
    - `user.created`
    - `user.updated`
    - `user.deleted`
  - Los payloads son DTOs `UserCreatedEvent`, `UserUpdatedEvent`, `UserDeletedEvent` con:
    - `userId`, `username`, `email`, `roles`, `eventTimestamp`.

- **Paso 4 – Consumo en Kafka Event Service**
  - Kafka Event Service escucha los topics anteriores usando `@KafkaListener`.
  - Por cada evento, ejecuta `EventSyncServiceImpl` que:
    - Registra en logs el procesamiento.
    - Simula la sincronización hacia otros sistemas (p.ej. caches, otros servicios de identidad).

### 4.2 Diagrama de flujo (ASCII)

```text
[Gestión de usuarios]

Cliente / Frontend
    │
    │ HTTP (JSON)
    ▼
BACKEND MATRÍCULA (8086)
    │  (orquesta)
    │
    ▼
AUTH SERVICE (8087)
 ┌─────────────────────────────────────────┐
 │ 1. Valida & persiste usuario en auth_db│
 │ 2. Construye evento UserCreated/Updated│
 │ 3. Publica en Kafka                    │
 └─────────────────────────────────────────┘
    │
    │ Eventos Kafka (user.created / .updated / .deleted)
    ▼
KAFKA (broker)
    │
    ▼
KAFKA EVENT SERVICE (8088)
 ┌─────────────────────────────────────────┐
 │ 1. Consume evento                      │
 │ 2. Loguea y simula sincronización      │
 └─────────────────────────────────────────┘
```

---

## 5. Flujo de notificaciones (Matrícula → RabbitMQ → Notification → Mailtrap)

### 5.1 Descripción paso a paso

- **Paso 1 – Creación de matrícula en backend**
  - El cliente realiza una operación de matrícula:
    - `POST http://localhost:8086/api/matriculas`
  - El backend valida negocio y persiste la matrícula en `matricula_db`.

- **Paso 2 – Envío de mensaje a RabbitMQ**
  - Tras crear la matrícula, el backend construye un mensaje DTO (por ejemplo `MatriculaNotificationDTO`) con:
    - `estudianteId`, `seccionId`, `estado`, `emailDestino`, etc.
  - Publica el mensaje en el exchange `notifications.exchange` con routing key `matricula.created`.

- **Paso 3 – Consumo en Notification Service**
  - Notification Service está suscrito a la cola `notifications.matricula`.
  - Un consumidor (`MatriculaNotificationConsumer`) recibe el mensaje y delega en `NotificationService`.
  - `NotificationServiceImpl`:
    - Construye el subject y el body usando `EmailTemplateBuilder`.
    - Envía el email con `JavaMailSender` a Mailtrap.

- **Paso 4 – Envío a Mailtrap**
  - Mailtrap recibe el correo y permite visualizarlo en la bandeja de pruebas.

### 5.2 Diagrama ASCII

```text
[Flujo de notificación de matrícula]

Cliente / Frontend
    │
    │ HTTP (JSON)
    ▼
BACKEND MATRÍCULA (8086)
 ┌──────────────────────────────────────┐
 │ 1. Crea matrícula en matricula_db   │
 │ 2. Construye MatriculaNotification  │
 │ 3. Publica mensaje en RabbitMQ      │
 └───────┬─────────────────────────────┘
         │
         │  Exchange: notifications.exchange
         │  Routing key: matricula.created
         ▼
       RABBITMQ (broker)
         │
         ▼
NOTIFICATION SERVICE (8089)
 ┌──────────────────────────────────────┐
 │ 1. Consume desde cola notifications.│
 │    matricula                        │
 │ 2. Construye email (plantilla)      │
 │ 3. Envia por SMTP a Mailtrap        │
 └─────────────────┬───────────────────┘
                   │
                   ▼
              MAILTRAP (Sandbox)
```

---

## 6. Instrucciones para clonar y ejecutar el proyecto

### 6.1 Clonar repositorio

```bash
git clone https://github.com/dnetkaizen/Microservicios_SpringBoot.git
cd Microservicios_SpringBoot
```

```bash
docker compose build
```

- **Qué hace**:
  - Compila cada microservicio con Maven.
  - Construye imágenes Docker para:
    - `backend-matricula` (MatriculaUniversitaria)
    - `auth-service` (AuthMatricula)
    - `kafka-event-service` (KafkaMatricula)
    - `notification-service` (RabbitMQMatricula)

### 6.3 Levantar el ecosistema

```bash
docker compose up -d
```

- **Servicios levantados**:
  - Bases de datos:
    - `postgres-backend` (`5432`)
    - `postgres-auth` (`5433`)
  - Mensajería:
    - `zookeeper` (`2181`)
    - `kafka` (`9092`)
    - `rabbitmq` (`5672`, UI en `15672`)
  - Microservicios:
    - `backend-matricula` (`8086`)
    - `auth-service` (`8087`)
    - `kafka-event-service` (`8088`)
    - `notification-service` (`8089`)
  - Frontend:
    - `frontend-matricula` (`5173`)

### 6.4 Validar contenedores y ver logs

- **Ver estado de contenedores**

  ```bash
  docker compose ps
  ```

- **Ver logs de un servicio concreto**

  ```bash
  docker compose logs -f backend-matricula
  docker compose logs -f auth-service
  docker compose logs -f kafka-event-service
  docker compose logs -f notification-service
  ```

- **Parar y bajar el stack**

  ```bash
  docker compose down
  ```

### 6.5 Flujo rápido de pruebas end-to-end (con frontend)

1. **Levantar todo el ecosistema**

   ```bash
   docker compose build
   docker compose up -d
   ```

   Espera a que `auth-service`, `backend-matricula` y `frontend-matricula` estén en estado `running`.

2. **Verificar variables del frontend**

   En `FrontendMatricula/.env` (ya incluido en el repo):

   ```env
   VITE_AUTH_API_URL=http://localhost:8087/api/auth
   VITE_BACKEND_API_URL=http://localhost:8086/api
   ```

3. **Usuarios y roles para la demo**

   - Crea en `auth_db` los usuarios de aplicación (por API o insert directo) por ejemplo:
     - `admin` (rol: **admin**)
     - `operador` (rol: **operador**)
   - Luego asígnales sus roles con:

     ```sql
     -- admin -> rol admin
     INSERT INTO auth_user_role (user_id, role_id)
     SELECT u.user_id, r.role_id
     FROM auth_user u, auth_role r
     WHERE u.username = 'admin' AND r.nombre = 'admin';

     -- operador -> rol operador
     INSERT INTO auth_user_role (user_id, role_id)
     SELECT u.user_id, r.role_id
     FROM auth_user u, auth_role r
     WHERE u.username = 'operador' AND r.nombre = 'operador';
     ```

   > Los permisos por rol se cargan automáticamente desde `AuthMatricula/src/main/resources/data.sql`.

4. **Acceder al frontend**

   - URL: `http://localhost:5173`
   - Login disponible:
     - **Google Sign-In** → crea usuarios con rol `estudiante` por defecto.
     - **Usuario/contraseña** (`/api/auth/login`) → para usuarios como `admin` y `operador`.

5. **Qué debería ver cada rol en el frontend**

   - **admin**
     - Sidebar y Dashboard con:
       - Módulo **Administración**: Usuarios, Roles, Permisos.
       - Módulo **Académico**: Cursos, Profesores, Secciones.
       - Módulo **Estudiantes**: Estudiantes, Matrículas.
     - Puede hacer CRUD completo en todos los módulos.

   - **operador**
     - No ve el módulo Administración.
     - Ve y gestiona:
       - Académico: Cursos, Profesores, Secciones.
       - Estudiantes: Estudiantes, Matrículas.

   - **estudiante**
     - Solo ve pantallas en modo lectura donde tiene permisos `*:READ` (por defecto: Cursos, Secciones, Matrículas).
     - No ve botones de crear/editar/eliminar.

---

## 7. Acceso a las consolas (RabbitMQ, Kafka, DB)

- **RabbitMQ Management UI**
  - URL: `http://localhost:15672`
  - Credenciales por defecto:
    - Usuario: `guest`
    - Password: `guest`

- **Correo de prueba (Mailtrap)**
  - URL: `https://mailtrap.io`
  - Usa las credenciales de tu cuenta en las variables:
    - `MAILTRAP_USERNAME`
    - `MAILTRAP_PASSWORD`

- **Base de datos backend (matricula_db)**
  - Host desde el host: `localhost`
  - Puerto: `5432`
  - Usuario: `admin`
  - Password: `admin`
  - BD: `matricula_db`

- **Base de datos auth (auth_db)**
  - Host desde el host: `localhost`
  - Puerto: `5433`
  - Usuario: `admin`
  - Password: `admin`
  - BD: `auth_db`

---

## 8. Endpoints de prueba (sin frontend)

> Los ejemplos asumen que los microservicios están levantados con Docker Compose.

- **✔ Probar creación de usuario (backend → kafka → auth)**  
  Endpoint orquestado por el backend que termina persistiendo en Auth y generando eventos Kafka.

  - Método: `POST`  
  - URL: `http://localhost:8086/api/auth/users`

- **✔ Probar creación de matrícula (backend → rabbit → notification → mailtrap)**  

  - Método: `POST`  
  - URL: `http://localhost:8086/api/matriculas`

- **✔ Probar envío manual desde notification-service**

  - Método: `POST`  
  - URL: `http://localhost:8089/api/notifications/email/test`

- **✔ Probar login en auth-service (JWT)**  

  - Método: `POST`  
  - URL: `http://localhost:8087/api/auth/login`

> Para payloads JSON concretos y flujos detallados, se recomienda revisar los archivos `TESTS.md` específicos de cada microservicio.

---

## 9. Docker Compose global

El archivo `docker-compose.yml` en la raíz del repositorio define **todo el ecosistema**:

- **Servicios incluidos**
  - **Bases de datos**
    - `postgres-backend`: `matricula_db` para MatriculaUniversitaria.
    - `postgres-auth`: `auth_db` para AuthMatricula.
  - **Kafka stack**
    - `zookeeper`
    - `kafka` (con auto-creation de topics y advertised listener `kafka:9092`).
  - **RabbitMQ**
    - `rabbitmq` con plugin de management.
  - **Microservicios**
    - `backend-matricula` (build `./MatriculaUniversitaria`)
    - `auth-service` (build `./AuthMatricula`)
    - `kafka-event-service` (build `./KafkaMatricula`)
    - `notification-service` (build `./RabbitMQMatricula`)

- **Conexión de bases de datos**
  - `backend-matricula`:
    - `SPRING_DATASOURCE_URL=jdbc:postgresql://postgres-backend:5432/matricula_db`
  - `auth-service`:
    - `SPRING_DATASOURCE_URL=jdbc:postgresql://postgres-auth:5432/auth_db`

- **Conexión de Kafka**
  - `auth-service` y `kafka-event-service`:
    - `SPRING_KAFKA_BOOTSTRAP_SERVERS=kafka:9092`

- **Conexión de RabbitMQ**
  - `notification-service`:
    - `SPRING_RABBITMQ_HOST=rabbitmq`
    - `SPRING_RABBITMQ_PORT=5672`

- **Variables de entorno importantes**
  - Bases de datos:
    - `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
  - Auth:
    - `SECURITY_JWT_SECRET` (secreto JWT para firmar tokens).
  - Mailtrap:
    - `MAILTRAP_USERNAME`, `MAILTRAP_PASSWORD` (injectados como env y referenciados por Spring Mail).

---

## 10. Diagrama detallado de red (hostnames internos Docker)

Dentro de la red Docker (`uni-net`), los contenedores se comunican por **hostname**:

```text
+----------------------+        +----------------------+ 
|  postgres-backend    |        |   postgres-auth      |
|  (PostgreSQL 15)     |        |  (PostgreSQL 15)     |
+----------+-----------+        +----------+-----------+
           ^                               ^
           |                               |
           | jdbc:postgresql://            | jdbc:postgresql://
           | postgres-backend:5432        | postgres-auth:5432
           |                               |
+----------+-----------+        +----------+-----------+
| backend-matricula    |        |    auth-service      |
| (MatriculaUniversitaria,8086) |        |  (AuthMatricula,8087)|
+----------------------+        +----------------------+

+----------------------+        +----------------------+
|      zookeeper       |        |        kafka         |
|      (2181)          |        | (broker, 9092)       |
+----------------------+        +----------+-----------+
                                          ^
                                          |
                        bootstrap-servers: kafka:9092
                                          |
             +----------------------------+--------------------+
             |                                                 |
+------------+----------------+              +-----------------+-------------+
|     auth-service            |              |   kafka-event-service        |
|  produce events (user.*)    |              |  consume events (user.*)     |
+-----------------------------+              +------------------------------+

+----------------------+        +-------------------------------+
|       rabbitmq       |        |    notification-service       |
| (broker, 5672/15672) |<-------| (RabbitMQMatricula, 8089)     |
+----------------------+  host: rabbitmq                        |
                               +--------------------------------+
```

Hostnames internos relevantes:

- **Bases de datos**
  - `postgres-backend`
  - `postgres-auth`

- **Mensajería**
  - `kafka`
  - `zookeeper`
  - `rabbitmq`

- **Microservicios**
  - `backend-matricula`
  - `auth-service`
  - `kafka-event-service`
  - `notification-service`

---

## 11. Estructura del repositorio

Ejemplo de estructura en la raíz del proyecto:

```text
/MatriculaUniversitaria         # Backend Matrícula (backend-matricula)
/AuthMatricula                  # Auth Service (auth-service)
/KafkaMatricula                 # Kafka Event Service (kafka-event-service)
/RabbitMQMatricula              # Notification Service (notification-service)

/FrontendMatricula              # Frontend Vite + React (frontend-matricula)

/docker-compose.yml             # Compose global del ecosistema
/README.md                      # README global (este archivo)
```

Cada microservicio contiene a su vez:

- **/src/main/java**: código fuente Java (controladores, servicios, entidades, etc.).
- **/src/main/resources**: `application.properties`, `schema.sql`, etc.
- **pom.xml**: configuración de Maven.
- **Dockerfile**: build multi-stage para generar la imagen del microservicio.

---

## 12. Tecnologías utilizadas

- **Lenguaje y plataforma**
  - **Java**: JDK 21 (compatible con 17+)
  - **Spring Boot 3.x**

- **Frameworks principales**
  - **Spring Web** (REST controllers)
  - **Spring Data JPA** (acceso a datos)
  - **Spring Validation** (validación de DTOs)
  - **Spring Security** (Auth Service)
  - **Spring Kafka** (Kafka Event Service, Auth Service)
  - **Spring AMQP** (RabbitMQ, Notification Service)
  - **Spring Mail** (envío de correos con JavaMailSender)
  - **Spring Boot Actuator** (health, métricas)

- **Infraestructura**
  - **Apache Kafka**
  - **RabbitMQ**
  - **PostgreSQL**
  - **Docker & Docker Compose**
  - **Mailtrap** (sandbox de correo)

- **Otras librerías**
  - **JPA / Hibernate**
  - **Lombok** (reducción de boilerplate)

---

## 13. Problemas frecuentes (FAQ)

- **¿Error de conexión a Kafka?**
  - **Verifica**:
    - `kafka` está levantado: `docker compose ps kafka`.
    - Variables `SPRING_KAFKA_BOOTSTRAP_SERVERS` apuntan a `kafka:9092` dentro de Docker.
    - No estás usando `localhost:9092` *dentro* de los contenedores.
  - **Logs**:
    - Revisa `docker compose logs -f kafka-event-service` y `auth-service`.

- **¿Por qué Auth no sincroniza usuarios?**
  - Verifica que:
    - `auth-service` esté levantado y respondiendo en `8087`.
    - `kafka-event-service` esté levantado y subscrito a los topics correctos.
    - Los endpoints de creación/actualización/eliminación de usuarios están siendo llamados y no devuelven error.
  - Asegúrate de que:
    - Los eventos `user.created`, `user.updated`, `user.deleted` se publiquen correctamente (revisar logs de `auth-service`).

- **¿No llega correo a Mailtrap?**
  - Revisa:
    - Variables `MAILTRAP_USERNAME` y `MAILTRAP_PASSWORD` en `docker-compose.yml`.
    - El servicio `notification-service` está levantado (`8089`).
    - El panel de Mailtrap para ver la inbox correcta.
  - Comprueba también:
    - Logs de `notification-service` (`docker compose logs -f notification-service`).
    - Que `rabbitmq` esté funcionando y recibiendo mensajes.

- **¿Docker no levanta contenedores / errores de puertos?**
  - Posibles causas:
    - Puertos ya ocupados (5432, 5433, 8086–8089, 9092, 15672, etc.).
  - Soluciones:
    - Cierra servicios locales (Postgres local, otros Kafka/RabbitMQ).
    - Ajusta puertos mapeados en `docker-compose.yml` si es necesario.

- **¿Cómo limpiar volúmenes corruptos o datos inconsistentes?**
  - **Bajar stack y volúmenes** (⚠️ elimina datos de BD):

    ```bash
    docker compose down -v
    ```

  - **Eliminar volúmenes específicos**:

    ```bash
    docker volume ls
    docker volume rm <nombre-volumen>
    ```

  - Luego vuelve a construir y levantar:

    ```bash
    docker compose build
    docker compose up -d
    ```

---

## 14. Contribuir al proyecto

- **Formato de Pull Requests**
  - **Título**: `[feature]`, `[fix]` o `[docs]` + descripción breve.
  - **Descripción**:
    - **Contexto**: qué problema resuelve.
    - **Cambios**: listado de cambios por microservicio.
    - **Pruebas**: cómo se verificó el cambio (comandos, endpoints).

- **Estándares de código**
  - **Java**
    - Estilo Java estándar (Google / Oracle).
    - Métodos y clases con nombres descriptivos.
  - **Spring**
    - Uso de `@Service`, `@Controller`, `@Repository`, `@Configuration` de forma clara.
    - DTOs separados de entidades.
    - Manejo centralizado de errores con `@ControllerAdvice`.
  - **Pruebas**
    - Añadir tests unitarios/integración cuando sea posible.
    - Mantener consistencia en naming de tests.

- **Cómo crear un microservicio nuevo**
  - **Pasos generales**:
    - Crear nuevo proyecto Spring Boot con su propio `pom.xml`.
    - Definir dominios (entidades, repositorios, servicios, controladores).
    - Añadir `Dockerfile` multi-stage.
    - Integrar en `docker-compose.yml` global:
      - Servicio con `build: ./<NuevaCarpeta>`
      - Dependencias (BD, brokers, etc.).
      - Variables de entorno necesarias.
    - Documentar en este README (o en un README específico de ese microservicio).

- **Cómo agregar un evento Kafka nuevo**
  - **Pasos**:
    - Definir un nuevo topic en la configuración (por ejemplo `order.created`).
    - Crear DTO de evento en el servicio emisor.
    - Crear un productor (KafkaTemplate) en el emisor.
    - Añadir `@KafkaListener` correspondiente en el consumidor.
    - Actualizar config de `KafkaConsumerConfig` (si es necesario un deserializador específico).
    - Probar de punta a punta (emisor → Kafka → consumidor).

---

## 15. Licencia

Este proyecto está licenciado bajo la **MIT License**.

```text
MIT License

Copyright (c) <Año> <Autor>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
