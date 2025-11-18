# Pruebas del microservicio notification-service (RabbitMQ + Mailtrap)

Este documento resume cómo levantar el microservicio `notification-service` y cómo probar sus endpoints de prueba que publican mensajes en RabbitMQ y disparan correos vía Mailtrap.

Base URL por defecto: `http://localhost:8089`

---

## 1. Ejecución del microservicio

### 1.1. Ejecución local (sin Docker)

Requisitos:

- RabbitMQ corriendo en `localhost:5672` (si quieres, puedes usar la imagen `rabbitmq:3-management`).
- Credenciales de Mailtrap configuradas en `application.properties`:
  - `spring.mail.username=TU_USUARIO_MAILTRAP_AQUI`
  - `spring.mail.password=TU_PASSWORD_MAILTRAP_AQUI`

Pasos:

```bash
cd RabbitMQMatricula
mvn spring-boot:run
```

El servicio quedará disponible en `http://localhost:8089`.

### 1.2. Ejecución con Docker Compose

Desde la carpeta `RabbitMQMatricula`:

```bash
docker compose up --build
```

Servicios:

- `rabbitmq` → cola AMQP en `localhost:5672` y panel en `http://localhost:15672` (user/pass `guest`/`guest`).
- `notification-service` → `http://localhost:8089`.

> Recuerda configurar tus credenciales reales de Mailtrap vía variables de entorno o modificando `application.properties` antes de probar correos reales.

---

## 2. Endpoints de prueba

### 2.1. Probar envío de email directo

**Endpoint**: `POST /api/notifications/email/test`

Ejemplo JSON (`EmailNotificationDTO`):

```json
{
  "to": "destino@example.com",
  "subject": "Prueba de notificación",
  "message": "Este es un correo de prueba desde notification-service."
}
```

Ejemplo cURL:

```bash
curl -X POST "http://localhost:8089/api/notifications/email/test" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "destino@example.com",
    "subject": "Prueba de notificación",
    "message": "Este es un correo de prueba desde notification-service."
  }'
```

Esperado:

- HTTP `202 Accepted`.
- En RabbitMQ: mensaje JSON en la cola `notifications.email`.
- En Mailtrap: correo recibido en la inbox del proyecto configurado.

---

### 2.2. Probar notificación de matrícula

**Endpoint**: `POST /api/notifications/matricula/test`

Ejemplo JSON (`MatriculaNotificationDTO`):

```json
{
  "estudianteId": 1,
  "seccionId": 101,
  "estado": "CREADA",
  "emailDestino": "estudiante@example.com"
}
```

Ejemplo cURL:

```bash
curl -X POST "http://localhost:8089/api/notifications/matricula/test" \
  -H "Content-Type: application/json" \
  -d '{
    "estudianteId": 1,
    "seccionId": 101,
    "estado": "CREADA",
    "emailDestino": "estudiante@example.com"
  }'
```

Flujo esperado:

1. El endpoint publica un mensaje `MatriculaNotificationDTO` en el exchange `notifications.exchange` con routing key `matricula.created`.
2. La cola `notifications.matricula` recibe el mensaje.
3. `MatriculaNotificationConsumer` consume el mensaje y llama a `NotificationService.handleMatriculaNotification`.
4. El servicio construye el asunto y cuerpo del correo usando `EmailTemplateBuilder` y envía un email a `emailDestino`.

---

### 2.3. Probar notificación de pago

**Endpoint**: `POST /api/notifications/pago/test`

Ejemplo JSON (`PagoNotificationDTO`):

```json
{
  "pagoId": 5001,
  "matriculaId": 3001,
  "monto": 750.50,
  "emailDestino": "pagos@example.com"
}
```

Ejemplo cURL:

```bash
curl -X POST "http://localhost:8089/api/notifications/pago/test" \
  -H "Content-Type: application/json" \
  -d '{
    "pagoId": 5001,
    "matriculaId": 3001,
    "monto": 750.50,
    "emailDestino": "pagos@example.com"
  }'
```

Flujo esperado:

1. Publicación del mensaje en `notifications.exchange` con routing key `pago.completed`.
2. Mensaje llega a la cola `notifications.pago`.
3. `PagoNotificationConsumer` procesa el mensaje y delega en `NotificationService.handlePagoNotification`.
4. Se envía un correo de confirmación de pago a `emailDestino`.

---

## 3. Verificación en RabbitMQ

Con Docker Compose levantado puedes entrar a:

- `http://localhost:15672` (user: `guest`, pass: `guest`).

Pasos:

1. Ir a la pestaña **Queues**.
2. Verificar que existan las colas:
   - `notifications.email`
   - `notifications.matricula`
   - `notifications.pago`
3. Después de llamar a los endpoints de prueba, hacer **Get messages** en cada cola para ver los mensajes JSON (si aún no fueron consumidos) o revisar los logs del microservicio para ver los consumos.

---

## 4. Manejo de errores

- Si el JSON enviado no pasa las validaciones (`@NotNull`, `@NotBlank`, `@Email`), obtendrás un `HTTP 400` con un cuerpo de error:
  - `timestamp`
  - `message` ("Error de validación")
  - `path`
  - `errors` (mapa campo → mensaje)

- Si hay problemas enviando el correo (por ejemplo credenciales Mailtrap incorrectas), se lanza `NotificationException` y recibirás un `HTTP 400` con:
  - `timestamp`
  - `message` (detalle del error lógico)
  - `path`

- Para errores inesperados, se devuelve `HTTP 500` con `timestamp`, `message` y `path`.

---

Con estos ejemplos puedes verificar el flujo completo RabbitMQ → notification-service → Mailtrap para los tres tipos de notificación (email directo, matrícula y pago).
