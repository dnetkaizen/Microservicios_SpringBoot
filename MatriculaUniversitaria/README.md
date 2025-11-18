# Backend Matricula Universitaria

Backend principal del sistema de matrícula universitaria, construido con **Spring Boot 3.x (Java 21)**, arquitectura limpia (MVC + servicios), principios **SOLID**, DTOs/mapper para no exponer entidades y preparado para integrarse con futuros microservicios (auth-service, kafka-service, rabbitmq-service).

---

## 1. Tecnologías y requisitos

- **Java**: 21 (definido en `pom.xml`)
- **Spring Boot**: 3.x
- **Base de datos**: PostgreSQL 16
- **ORM**: Spring Data JPA + Hibernate
- **Build**: Maven
- **Docker / Docker Compose**: para despliegue completo (Postgres + pgAdmin + backend)

Requisitos previos para levantar el proyecto:

- JDK 21 instalado
- Maven 3.9+ instalado (si vas a ejecutar sin Docker)
- Docker y Docker Compose instalados (si vas a usar contenedores)

---

## 2. Modelo de datos (schema.sql)

La base de datos se inicializa desde `src/main/resources/schema.sql` (configurado en `application.properties`).

Tablas principales del sistema de matrícula:

- **estudiante**
- **profesor**
- **curso**
- **seccion**
- **matricula**

Tablas de autenticación/autorización:

- **auth_user**
- **auth_role**
- **auth_permission**
- **auth_user_role** (tabla puente Many-to-Many user–role)
- **auth_role_permission** (tabla puente Many-to-Many role–permission)

Las entidades JPA en `entity/` corresponden 1:1 con estas tablas, respetando nombres de columnas, tipos y constraints.

---

## 3. Arquitectura del proyecto

Paquete base: `com.matricula_universitaria`.

Estructura bajo `src/main/java/com/matricula_universitaria`:

- **MatriculaUniversitariaApplication.java**
- **config/**
  - `CorsConfig` – configuración global de CORS para `/api/**`.
- **controller/**
  - `EstudianteController`, `ProfesorController`, `CursoController`, `SeccionController`, `MatriculaController`
  - `AuthUserController`, `AuthRoleController`, `AuthPermissionController`
- **service/**
  - Interfaces: `EstudianteService`, `ProfesorService`, `CursoService`, `SeccionService`, `MatriculaService`
  - Interfaces: `AuthUserService`, `AuthRoleService`, `AuthPermissionService`
- **service/impl/**
  - Implementaciones concretas: `*ServiceImpl` para cada interfaz.
- **repository/**
  - `EstudianteRepository`, `ProfesorRepository`, `CursoRepository`, `SeccionRepository`, `MatriculaRepository`
  - `AuthUserRepository`, `AuthRoleRepository`, `AuthPermissionRepository`
  - `AuthUserRoleRepository`, `AuthRolePermissionRepository`
- **dto/** (usando `record`)
  - Requests/Responses separados para cada agregado (p.ej. `EstudianteRequestDto` y `EstudianteResponseDto`).
  - Validaciones con `@NotNull`, `@NotBlank`, `@Email`, `@Size`, `@Positive`, `@DecimalMin`, etc.
- **mapper/**
  - Mappers manuales `*Mapper` para convertir entre entidades y DTOs.
- **entity/**
  - Entidades de matrícula: `Estudiante`, `Profesor`, `Curso`, `Seccion`, `Matricula`.
  - Entidades de auth: `AuthUser`, `AuthRole`, `AuthPermission`.
  - Tablas puente: `AuthUserRole` (+ `AuthUserRoleId`), `AuthRolePermission` (+ `AuthRolePermissionId`).
  - Uso de anotaciones JPA: `@Entity`, `@Table`, `@ManyToOne`, `@OneToMany`, `@EmbeddedId`, `@MapsId`, `@JoinColumn`, `@UniqueConstraint`, etc.
  - Campos `activo` y `fecha_registro` con lógica `@PrePersist` según el `schema.sql`.
- **exceptions/**
  - `CustomException` (envuelve un `HttpStatus`).
  - `ResourceNotFoundException` (404).
  - `BadRequestException` (400).
  - `ErrorResponse` (record para respuestas de error).
  - `GlobalExceptionHandler` (`@RestControllerAdvice`) para enviar errores uniformes en JSON.

### Desacoplamiento por capas

- **Controller**: solo orquesta peticiones HTTP y delega en servicios. Trabaja con DTOs.
- **Service**: contiene la lógica de negocio y reglas (validaciones, integridad, reglas de matrícula, asignaciones de roles/permisos, etc.).
- **Repository**: acceso a datos (JPA). No contiene lógica de negocio.
- **Entity**: modelo de dominio y mapeo relacional.
- **DTO + Mapper**: evitan exponer entidades directamente; controlan el contrato de la API.
- **Exceptions**: capa separada para manejo de errores y respuestas consistentes.

Esto facilita migrar hacia microservicios y añadir integración con Kafka/RabbitMQ sin romper la arquitectura.

---

## 4. Configuración de Spring Boot

Archivo: `src/main/resources/application.properties`

Puntos clave:

- Puerto de la aplicación:
  - `server.port=8086`
- Postgres local (modo desarrollo):
  - `spring.datasource.url=jdbc:postgresql://localhost:5432/matricula_db`
  - `spring.datasource.username=admin`
  - `spring.datasource.password=admin`
  - `spring.datasource.driver-class-name=org.postgresql.Driver`
- Inicialización SQL:
  - `spring.sql.init.mode=always`
  - `spring.sql.init.encoding=UTF-8`
  - `spring.sql.init.schema-locations=classpath:schema.sql`
- JPA / Hibernate:
  - `spring.jpa.hibernate.ddl-auto=none` (NO genera esquema automáticamente, respeta `schema.sql`).
  - `spring.jpa.show-sql=true`
  - `spring.jpa.properties.hibernate.format_sql=true`
  - `spring.jpa.properties.hibernate.jdbc.lob.non_contextual_creation=true`
  - `spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect`
  - Naming: `PhysicalNamingStrategyStandardImpl` (sin cambiar nombres de tabla/columna).
- Logging SQL:
  - `logging.level.org.hibernate.SQL=DEBUG`
  - `logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE`

---

## 5. Endpoints REST principales

Todos los endpoints devuelven JSON y usan `ResponseEntity`, validación `@Valid` y manejadores de excepción globales.

### 5.1 Estudiantes

Base: `/api/estudiantes`

- `POST /` – Crear estudiante.
- `PUT /{id}` – Actualizar estudiante.
- `DELETE /{id}` – Eliminar estudiante.
- `GET /{id}` – Obtener estudiante por id.
- `GET /?apellido=...` – Buscar por apellido.
- `GET /` – Listar todos.

### 5.2 Profesores

Base: `/api/profesores`

- Mismo patrón que estudiantes (incluye búsqueda por apellido).

### 5.3 Cursos

Base: `/api/cursos`

- `POST /` – Crear curso.
- `PUT /{id}` – Actualizar curso.
- `DELETE /{id}` – Eliminar curso.
- `GET /{id}` – Obtener curso.
- `GET /` – Listar todos.

### 5.4 Secciones

Base: `/api/secciones`

- `POST /` – Crear sección asociada a un curso y profesor.
- `PUT /{id}` – Actualizar sección.
- `DELETE /{id}` – Eliminar.
- `GET /{id}` – Obtener sección.
- `GET /?cursoId=...` – Listar secciones por curso.
- `GET /?profesorId=...` – Listar secciones por profesor.
- `GET /` – Listar todas.

### 5.5 Matrículas

Base: `/api/matriculas`

- `POST /` – Crear matrícula (estudiante + sección), validando unicidad `(estudiante, seccion)`.
- `PUT /{id}` – Actualizar matrícula (estado, costo, etc.).
- `DELETE /{id}` – Eliminar.
- `GET /{id}` – Obtener matrícula.
- `GET /?estudianteId=...` – Listar matrículas por estudiante.
- `GET /?seccionId=...` – Listar matrículas por sección.
- `GET /` – Listar todas.

### 5.6 Auth: Usuarios, Roles, Permisos

#### Usuarios (`AuthUser`)

Base: `/api/auth/users`

- `POST /` – Crear usuario (username, email, password, activo).
- `PUT /{id}` – Actualizar usuario.
- `DELETE /{id}` – Eliminar usuario.
- `GET /{id}` – Obtener usuario.
- `GET /` – Listar todos.
- `POST /{userId}/roles/{roleId}` – Asignar rol a usuario.
- `DELETE /{userId}/roles/{roleId}` – Quitar rol de usuario.

#### Roles (`AuthRole`)

Base: `/api/auth/roles`

- `POST /` – Crear rol.
- `PUT /{id}` – Actualizar rol.
- `DELETE /{id}` – Eliminar rol.
- `GET /{id}` – Obtener rol.
- `GET /` – Listar roles.
- `POST /{roleId}/permissions/{permissionId}` – Asignar permiso a rol.
- `DELETE /{roleId}/permissions/{permissionId}` – Quitar permiso de rol.

#### Permisos (`AuthPermission`)

Base: `/api/auth/permissions`

- `POST /` – Crear permiso.
- `PUT /{id}` – Actualizar permiso.
- `DELETE /{id}` – Eliminar permiso.
- `GET /{id}` – Obtener permiso.
- `GET /` – Listar permisos.

---

## 6. Cómo ejecutar el backend

### 6.1 Opción A: Local (sin Docker)

1. Asegúrate de tener PostgreSQL corriendo localmente con:
   - Base de datos: `matricula_db`
   - Usuario: `admin`
   - Password: `admin`
   - Puerto: `5432`

2. Verifica que `application.properties` tenga:
   - `spring.datasource.url=jdbc:postgresql://localhost:5432/matricula_db`
   - `spring.datasource.username=admin`
   - `spring.datasource.password=admin`

3. Ejecuta el proyecto con Maven:

   ```bash
   mvn spring-boot:run
   ```

4. La API estará disponible en:

   - `http://localhost:8086` (por ejemplo, `GET http://localhost:8086/api/estudiantes`).

### 6.2 Opción B: Con Docker Compose

Esta opción levanta **Postgres + pgAdmin + backend** en contenedores.

1. Desde la raíz del proyecto (donde está `docker-compose.yml`):

   ```bash
   docker-compose up --build
   ```

2. Servicios:
   - **Postgres**: `postgres-backend` en `localhost:5432`
   - **pgAdmin**: `http://localhost:5050` 
     - Usuario: `admin@admin.com`
     - Password: `admin`
   - **Backend**: `backend-matricula` en `http://localhost:8086`

3. La app se conectará a la BD de Postgres del contenedor usando las variables de entorno definidas en `docker-compose.yml`.

4. Para detener los servicios:

   ```bash
   docker-compose down
   ```

---

## 7. Preparación para futuros microservicios (auth, kafka, rabbitmq)

El diseño del backend se ha hecho pensando en evolución hacia una arquitectura de microservicios:

- La capa de **auth** (usuarios, roles, permisos) está claramente separada en sus propios paquetes (`entity`, `dto`, `mapper`, `service`, `controller`). Esto permitirá extraerla en el futuro a un `auth-service` sin cambiar el contrato de la API.
- Las **entidades de dominio** de matrícula (`Estudiante`, `Curso`, `Seccion`, `Matricula`) están organizadas de forma independiente de infrastructura, facilitando publicar eventos de dominio (por ejemplo, "matrícula creada") hacia Kafka o RabbitMQ en nuevas capas/configuraciones.
- El uso de **DTOs y mappers** evita acoplar el contrato REST a las entidades JPA, lo que facilita cambios internos sin romper clientes.
- La capa de **excepciones globales** permite mantener un formato uniforme de errores, útil cuando se orquesta este backend junto con otros microservicios.

Posibles siguientes pasos para microservicios:

- Agregar un módulo de **mensajería** (por ejemplo, `kafka` o `rabbitmq`) con listeners/producers en servicios de matrícula.
- Extraer la parte de **auth** a un microservicio separado, exponiendo JWT u otro mecanismo de seguridad.

---

## 8. Notas finales

- El proyecto usa Java 21 y Spring Boot 3.x.
- El esquema de BD se controla al 100% desde `schema.sql` (`ddl-auto=none`).
- Todos los endpoints devuelven JSON, con manejo de errores consistente vía `GlobalExceptionHandler`.
- La arquitectura en capas (controller → service → repository → entity) permite mantener el código mantenible y listo para crecer hacia una solución de microservicios.
