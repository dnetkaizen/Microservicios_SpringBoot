# AuthMatricula - Microservicio `auth-service`

Microservicio de autenticación y autorización para el sistema de matrícula universitaria.

- **Stack**: Spring Boot 3.5.7, Java 21, Spring Web, Spring Data JPA, Spring Security, PostgreSQL, Validation, Lombok, Actuator.
- **Seguridad**: Spring Security + JWT (stateless), `BCryptPasswordEncoder`, `UserDetailsService` personalizado.
- **BD**: PostgreSQL (`auth_db`) con tablas `auth_user`, `auth_role`, `auth_permission`, tablas puente `auth_user_role`, `auth_role_permission`.
- **Puerto por defecto**: `8087`.

---

## 1. Arquitectura de paquetes

```text
src/main/java/com/matricula_universitaria
├── AuthMatriculaApplication.java
├── config
│   └── CorsConfig.java
├── controller
│   ├── AuthController.java
│   ├── AuthPermissionController.java
│   ├── AuthRoleController.java
│   └── AuthUserController.java
├── dto
│   ├── AuthPermissionRequestDto.java
│   ├── AuthPermissionResponseDto.java
│   ├── AuthRoleRequestDto.java
│   ├── AuthRoleResponseDto.java
│   ├── AuthUserRequestDto.java
│   ├── AuthUserResponseDto.java
│   ├── JwtResponse.java
│   ├── LoginRequest.java
│   └── RegisterRequest.java
├── entity
│   ├── AuthPermission.java
│   ├── AuthRole.java
│   ├── AuthRolePermission.java
│   ├── AuthRolePermissionId.java
│   ├── AuthUser.java
│   ├── AuthUserRole.java
│   └── AuthUserRoleId.java
├── exceptions
│   ├── BadRequestException.java
│   ├── CustomException.java
│   ├── ErrorResponse.java
│   ├── GlobalExceptionHandler.java
│   └── ResourceNotFoundException.java
├── mapper
│   ├── AuthPermissionMapper.java
│   ├── AuthRoleMapper.java
│   └── AuthUserMapper.java
├── repository
│   ├── AuthPermissionRepository.java
│   ├── AuthRolePermissionRepository.java
│   ├── AuthRoleRepository.java
│   ├── AuthUserRepository.java
│   └── AuthUserRoleRepository.java
├── security
│   ├── AuthUserDetailsService.java
│   ├── config
│   │   └── SecurityConfig.java
│   └── jwt
│       ├── JwtFilter.java
│       └── JwtUtil.java
└── service
    ├── AuthAuthenticationService.java
    ├── AuthPermissionService.java
    ├── AuthRoleService.java
    ├── AuthUserService.java
    └── impl
        ├── AuthAuthenticationServiceImpl.java
        ├── AuthPermissionServiceImpl.java
        ├── AuthRoleServiceImpl.java
        └── AuthUserServiceImpl.java
```

---

## 2. Entidades JPA y modelo de datos

Basado estrictamente en `src/main/resources/schema.sql`:

- `AuthUser` → tabla `auth_user`
  - Campos: `user_id`, `username`, `email`, `password`, `activo`, `fecha_registro`.
  - Relaciones:
    - `Set<AuthUserRole> userRoles` → tabla puente `auth_user_role`.
- `AuthRole` → tabla `auth_role`
  - Campos: `role_id`, `nombre`, `descripcion`.
  - Relaciones:
    - `Set<AuthUserRole> userRoles`.
    - `Set<AuthRolePermission> rolePermissions`.
- `AuthPermission` → tabla `auth_permission`
  - Campos: `permission_id`, `nombre`, `descripcion`.
  - Relaciones:
    - `Set<AuthRolePermission> rolePermissions`.
- `AuthUserRole` → tabla `auth_user_role`
  - Clave compuesta `AuthUserRoleId(user_id, role_id)`.
  - `@ManyToOne` a `AuthUser` y `AuthRole` con `@MapsId`.
- `AuthRolePermission` → tabla `auth_role_permission`
  - Clave compuesta `AuthRolePermissionId(role_id, permission_id)`.
  - `@ManyToOne` a `AuthRole` y `AuthPermission` con `@MapsId`.

Todas las tablas y columnas respetan los nombres EXACTOS del `schema.sql`.

---

## 3. DTOs

DTOs como `record` con validaciones:

- Usuario
  - `AuthUserRequestDto(username, email, password, activo)`
  - `AuthUserResponseDto(id, username, email, activo, Set<String> roles)`
- Rol
  - `AuthRoleRequestDto(nombre, descripcion)`
  - `AuthRoleResponseDto(id, nombre, descripcion, Set<String> permissions)`
- Permiso
  - `AuthPermissionRequestDto(nombre, descripcion)`
  - `AuthPermissionResponseDto(id, nombre, descripcion)`
- Auth
  - `LoginRequest(usernameOrEmail, password)`
  - `RegisterRequest(username, email, password)`
  - `JwtResponse(token, type, username, email, roles)`

---

## 4. Mappers

Mappers manuales (`@Component`):

- `AuthUserMapper`
  - `toEntity(AuthUserRequestDto)`
  - `updateEntityFromDto(AuthUserRequestDto, AuthUser)`
  - `toResponseDto(AuthUser)` → arma `Set<String> roles` desde las relaciones.
- `AuthRoleMapper`
  - `toEntity(AuthRoleRequestDto)`
  - `updateEntityFromDto(AuthRoleRequestDto, AuthRole)`
  - `toResponseDto(AuthRole)` → arma `Set<String> permissions`.
- `AuthPermissionMapper`
  - `toEntity(AuthPermissionRequestDto)`
  - `updateEntityFromDto(AuthPermissionRequestDto, AuthPermission)`
  - `toResponseDto(AuthPermission)`.

---

## 5. Repositorios

Interfaces `JpaRepository`:

- `AuthUserRepository extends JpaRepository<AuthUser, Long>`
  - `Optional<AuthUser> findByUsernameIgnoreCase(String username)`
  - `Optional<AuthUser> findByEmailIgnoreCase(String email)`
- `AuthRoleRepository extends JpaRepository<AuthRole, Long>`
  - `Optional<AuthRole> findByNombreIgnoreCase(String nombre)`
- `AuthPermissionRepository extends JpaRepository<AuthPermission, Long>`
  - `Optional<AuthPermission> findByNombreIgnoreCase(String nombre)`
- `AuthUserRoleRepository extends JpaRepository<AuthUserRole, AuthUserRoleId>`
- `AuthRolePermissionRepository extends JpaRepository<AuthRolePermission, AuthRolePermissionId>`

---

## 6. Servicios (SOLID)

Interfaces:

- `AuthUserService`
  - `crear`, `actualizar`, `eliminar`, `obtenerPorId`, `listarTodos`, `asignarRol`, `removerRol`.
- `AuthRoleService`
  - `crear`, `actualizar`, `eliminar`, `obtenerPorId`, `listarTodos`, `asignarPermiso`, `removerPermiso`.
- `AuthPermissionService`
  - `crear`, `actualizar`, `eliminar`, `obtenerPorId`, `listarTodos`.
- `AuthAuthenticationService`
  - `register(RegisterRequest)`, `login(LoginRequest)`, `me(String usernameOrEmail)`.

Implementaciones en `service.impl` con reglas de negocio:

- Validación de unicidad (username, email, nombre de rol, nombre de permiso).
- Manejo de relaciones ManyToMany mediante tablas puente.
- Uso de excepciones de dominio (`BadRequestException`, `ResourceNotFoundException`).

`AuthAuthenticationServiceImpl`:

- `register` → crea usuario con `BCryptPasswordEncoder`.
- `login` → autentica con `AuthenticationManager`, genera JWT con `JwtUtil` y devuelve `JwtResponse`.
- `me` → obtiene datos del usuario por username/email.

---

## 7. Seguridad (Spring Security + JWT)

### Beans principales

- `SecurityConfig` (`security/config/SecurityConfig.java`)
  - `@EnableMethodSecurity`.
  - `PasswordEncoder` → `BCryptPasswordEncoder`.
  - `UserDetailsService` → `AuthUserDetailsService`.
  - `AuthenticationProvider` → `DaoAuthenticationProvider` con el `UserDetailsService` y `PasswordEncoder`.
  - `AuthenticationManager` (desde `AuthenticationConfiguration`).
  - `SecurityFilterChain`:
    - `csrf` deshabilitado.
    - `SessionCreationPolicy.STATELESS`.
    - Rutas públicas: `/api/auth/register`, `/api/auth/login`.
    - Resto de rutas: autenticadas.
    - Filtro `JwtFilter` antes de `UsernamePasswordAuthenticationFilter`.

### JWT

- `JwtUtil` (`security/jwt/JwtUtil.java`)
  - Genera tokens con HS256.
  - Configurable por properties/env:
    - `security.jwt.secret` (por defecto `changeThisSecretKeyChangeThisSecretKey`).
    - `security.jwt.expiration-ms` (por defecto `3600000` ms).
  - Métodos: `generateToken`, `getUsernameFromToken`, `isTokenValid`.

- `JwtFilter` (`security/jwt/JwtFilter.java`)
  - Lee header `Authorization: Bearer <token>`.
  - Extrae username, carga `UserDetails` vía `AuthUserDetailsService`.
  - Si el token es válido, coloca un `UsernamePasswordAuthenticationToken` en el `SecurityContext`.
  - No filtra rutas `/api/auth/login` y `/api/auth/register`.

- `AuthUserDetailsService` (`security/AuthUserDetailsService.java`)
  - Busca usuarios en `auth_user` por `username` o `email`.
  - Construye `UserDetails` con:
    - Estado activo: `user.getActivo()`.
    - Authorities:
      - `ROLE_<nombre_rol>` para cada rol.
      - Nombres de permisos como authorities adicionales.

---

## 8. Controladores REST

### `AuthController` (`/api/auth`)

- `POST /api/auth/register`
  - Body: `RegisterRequest`.
  - Crea usuario y devuelve `AuthUserResponseDto`.

- `POST /api/auth/login`
  - Body: `LoginRequest`.
  - Devuelve `JwtResponse` con token JWT.

- `GET /api/auth/me`
  - Requiere header `Authorization: Bearer <token>`.
  - Usa el `Authentication` actual para obtener el username.
  - Devuelve `AuthUserResponseDto`.

### `AuthUserController` (`/api/auth/users`)

- `POST /api/auth/users`
- `PUT /api/auth/users/{id}`
- `DELETE /api/auth/users/{id}`
- `GET /api/auth/users/{id}`
- `GET /api/auth/users`
- `POST /api/auth/users/{userId}/roles/{roleId}`
- `DELETE /api/auth/users/{userId}/roles/{roleId}`

### `AuthRoleController` (`/api/auth/roles`)

- `POST /api/auth/roles`
- `PUT /api/auth/roles/{id}`
- `DELETE /api/auth/roles/{id}`
- `GET /api/auth/roles/{id}`
- `GET /api/auth/roles`
- `POST /api/auth/roles/{roleId}/permissions/{permissionId}`
- `DELETE /api/auth/roles/{roleId}/permissions/{permissionId}`

### `AuthPermissionController` (`/api/auth/permissions`)

- `POST /api/auth/permissions`
- `PUT /api/auth/permissions/{id}`
- `DELETE /api/auth/permissions/{id}`
- `GET /api/auth/permissions/{id}`
- `GET /api/auth/permissions`

Todos los métodos usan `ResponseEntity` y `@Valid` en los cuerpos de entrada.

---

## 9. Excepciones y manejo global

Paquete `exceptions`:

- `CustomException` → base con `HttpStatus`.
- `ResourceNotFoundException` → 404.
- `BadRequestException` → 400.
- `ErrorResponse` → record estándar para respuestas de error.
- `GlobalExceptionHandler` (`@RestControllerAdvice`)
  - Maneja `CustomException`.
  - Maneja validaciones (`MethodArgumentNotValidException`, `ConstraintViolationException`).
  - Maneja `DataIntegrityViolationException` (409).
  - Maneja `Exception` genérica (500).

---

## 10. Configuración CORS

`config/CorsConfig.java`:

- Bean `WebMvcConfigurer` que:
  - Permite CORS para `/api/**`.
  - `allowedOrigins("*")`, `allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")`.
  - `allowedHeaders("*")`.

---

## 11. Docker

### Dockerfile

En la raíz del proyecto `AuthMatricula`:

- Etapa **builder** con `maven:3.9-eclipse-temurin-21`.
- Compila el proyecto y genera `AuthMatricula-0.0.1-SNAPSHOT.jar`.
- Etapa **runtime** con `eclipse-temurin:21-jre`.
- Expone puerto `8087`.

### docker-compose.yml

Servicios:

- `postgres-auth`
  - Imagen `postgres:15`.
  - BD: `auth_db`.
  - Usuario: `admin`.
  - Password: `admin`.
  - Puerto host: `5433` → contenedor `5432`.
- `auth-service`
  - `build: .` (usa el Dockerfile de `AuthMatricula`).
  - `depends_on: [postgres-auth]`.
  - Variables de entorno:
    - `SPRING_DATASOURCE_URL=jdbc:postgresql://postgres-auth:5432/auth_db`
    - `SPRING_DATASOURCE_USERNAME=admin`
    - `SPRING_DATASOURCE_PASSWORD=admin`
    - `SECURITY_JWT_SECRET=changeThisSecretKeyChangeThisSecretKey`
  - Puertos: `8087:8087`.

> Nota: No se modifica `application.properties`; en Docker la URL de la BD se sobrescribe mediante variables de entorno.

---

## 12. Cómo ejecutar

### Local (sin Docker)

1. Levanta PostgreSQL en `localhost:5433` con:
   - BD: `auth_db`
   - Usuario: `admin`
   - Password: `admin`
2. Asegúrate de que `schema.sql` se ejecute automáticamente (propiedades ya configuradas).
3. Desde la carpeta `AuthMatricula`:

```bash
mvn spring-boot:run
```

El servicio quedará en `http://localhost:8087`.

### Con Docker

Desde la carpeta `AuthMatricula`:

```bash
docker compose up --build
```

- `auth-service`: `http://localhost:8087`.
- `postgres-auth`: `localhost:5433`.

---

## 13. Flujo típico de uso (JWT)

1. **Registrar usuario**
   - `POST http://localhost:8087/api/auth/register`
2. **Login**
   - `POST http://localhost:8087/api/auth/login`
   - Recibirás `JwtResponse.token`.
3. **Consultar usuario actual**
   - `GET http://localhost:8087/api/auth/me`
   - Header: `Authorization: Bearer <token>`.

Con esto el microservicio `auth-service` queda listo para integrarse con el resto del sistema de matrícula.
