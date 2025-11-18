# Guía rápida de pruebas del backend

Este documento resume cómo **levantar la API** (local y Docker) y ejemplos de **JSON/cURL** para probar los endpoints principales.

---

## 1. Cómo ejecutar la API

### 1.1 Ejecución local (sin Docker)

Requisitos:
- PostgreSQL corriendo en `localhost:5432` con:
  - Base de datos: `matricula_db`
  - Usuario: `admin`
  - Password: `admin`

Pasos:

```bash
# Desde la raíz del proyecto
mvn spring-boot:run
```

- La API quedará disponible en:
  - **Base URL**: `http://localhost:8086`

### 1.2 Ejecución con Docker Compose

Requisitos:
- Docker + Docker Compose instalados.

Pasos:

```bash
# Desde la raíz del proyecto (donde está docker-compose.yml)
docker-compose up --build
```

Servicios levantados:
- **Backend**: `http://localhost:8086`
- **Postgres**: `localhost:5432` (contenedor `postgres-backend`)
- **pgAdmin**: `http://localhost:5050` (usuario `admin@admin.com`, password `admin`)

Para detener:

```bash
docker-compose down
```

En ambos casos (local o Docker), la base URL de la API es:

- `http://localhost:8086`

---

## 2. Orden recomendado de pruebas

1. Crear **Profesor**.
2. Crear **Curso**.
3. Crear **Sección** (usa `cursoId` y `profesorId`).
4. Crear **Estudiante**.
5. Crear **Matrícula** (usa `estudianteId` y `seccionId`).
6. Probar endpoints de **Auth** (users, roles, permissions, asignaciones).

---

## 3. Endpoints y ejemplos JSON

### 3.1 Estudiantes

**Endpoint base**: `/api/estudiantes`

#### Crear estudiante

- **POST** `http://localhost:8086/api/estudiantes`

Request JSON:

```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "dni": "12345678",
  "email": "juan.perez@example.com",
  "telefono": "+51 999999999",
  "fechaNacimiento": "2000-05-10",
  "direccion": "Av. Siempre Viva 123",
  "activo": true
}
```

Ejemplo cURL:

```bash
curl -X POST "http://localhost:8086/api/estudiantes" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "dni": "12345678",
    "email": "juan.perez@example.com",
    "telefono": "+51 999999999",
    "fechaNacimiento": "2000-05-10",
    "direccion": "Av. Siempre Viva 123",
    "activo": true
  }'
```

#### Listar y buscar

- **GET** `http://localhost:8086/api/estudiantes` – listar todos.
- **GET** `http://localhost:8086/api/estudiantes?apellido=Pérez` – filtrar por apellido.
- **GET** `http://localhost:8086/api/estudiantes/{id}` – obtener por id.

---

### 3.2 Profesores

**Endpoint base**: `/api/profesores`

#### Crear profesor

- **POST** `http://localhost:8086/api/profesores`

Request JSON:

```json
{
  "nombre": "María",
  "apellido": "García",
  "dni": "87654321",
  "email": "maria.garcia@example.com",
  "telefono": "+51 988888888",
  "especialidad": "Matemáticas",
  "tituloAcademico": "Magíster en Educación",
  "activo": true
}
```

---

### 3.3 Cursos

**Endpoint base**: `/api/cursos`

#### Crear curso

- **POST** `http://localhost:8086/api/cursos`

Request JSON:

```json
{
  "codigo": "MAT101",
  "nombre": "Matemáticas Básicas",
  "descripcion": "Curso introductorio de matemáticas.",
  "creditos": 4,
  "nivelSemestre": 1,
  "activo": true
}
```

---

### 3.4 Secciones

**Endpoint base**: `/api/secciones`

Antes de crear una sección, necesitas un **curso** y un **profesor** ya creados.

#### Crear sección

- **POST** `http://localhost:8086/api/secciones`

Request JSON:

```json
{
  "cursoId": 1,
  "profesorId": 1,
  "codigo": "MAT101-A",
  "capacidadMaxima": 30,
  "aula": "A-101",
  "horario": "08:00-10:00",
  "dias": "Lunes-Miércoles",
  "periodoAcademico": "2025-1",
  "fechaInicio": "2025-03-01",
  "fechaFin": "2025-07-15",
  "activo": true
}
```

#### Listar secciones

- **GET** `/api/secciones` – todas.
- **GET** `/api/secciones?cursoId=1` – por curso.
- **GET** `/api/secciones?profesorId=1` – por profesor.

---

### 3.5 Matrículas

**Endpoint base**: `/api/matriculas`

Necesitas un **estudiante** y una **sección** creados.

#### Crear matrícula

- **POST** `http://localhost:8086/api/matriculas`

Request JSON:

```json
{
  "estudianteId": 1,
  "seccionId": 1,
  "fechaMatricula": "2025-03-05",
  "estado": "ACTIVA",
  "costo": 500.00,
  "metodoPago": "TARJETA"
}
```

> Nota: `estado` es un `String` libre (puedes usar valores como `ACTIVA`, `ANULADA`, etc.), 
> y `costo` es un decimal.

#### Consultas de matrículas

- **GET** `/api/matriculas` – todas.
- **GET** `/api/matriculas/{id}` – por id.
- **GET** `/api/matriculas?estudianteId=1` – por estudiante.
- **GET** `/api/matriculas?seccionId=1` – por sección.

---

## 4. Endpoints de Auth (usuarios, roles, permisos)

### 4.1 Permisos

**Endpoint base**: `/api/auth/permissions`

#### Crear permiso

- **POST** `http://localhost:8086/api/auth/permissions`

Request JSON:

```json
{
  "nombre": "READ_ESTUDIANTES",
  "descripcion": "Permite leer la lista de estudiantes"
}
```

### 4.2 Roles

**Endpoint base**: `/api/auth/roles`

#### Crear rol

- **POST** `http://localhost:8086/api/auth/roles`

Request JSON:

```json
{
  "nombre": "ADMIN",
  "descripcion": "Administrador del sistema"
}
```

#### Asignar permiso a rol

- **POST** `http://localhost:8086/api/auth/roles/{roleId}/permissions/{permissionId}`

Ejemplo:

```bash
curl -X POST "http://localhost:8086/api/auth/roles/1/permissions/1"
```

### 4.3 Usuarios

**Endpoint base**: `/api/auth/users`

#### Crear usuario

- **POST** `http://localhost:8086/api/auth/users`

Request JSON:

```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "Admin1234",
  "activo": true
}
```

#### Asignar rol a usuario

- **POST** `http://localhost:8086/api/auth/users/{userId}/roles/{roleId}`

Ejemplo:

```bash
curl -X POST "http://localhost:8086/api/auth/users/1/roles/1"
```

---

## 5. Notas de validación y errores

- Si envías datos inválidos (por ejemplo, email mal formado, campos `@NotBlank` vacíos, etc.),
  obtendrás un **HTTP 400** con un JSON de error estándar proveniente de `GlobalExceptionHandler`.
- Si solicitas un recurso inexistente (por `id`), obtendrás **HTTP 404** con un mensaje del tipo
  `"Estudiante no encontrado con id X"`, `"Curso no encontrado..."`, etc.
- Si intentas crear recursos duplicados (mismo DNI, email, código de curso, username, nombre de rol/permiso, o matrícula repetida),
  obtendrás **HTTP 400** con un mensaje de `BadRequestException`.

---

## 6. Uso junto con futuros microservicios

Aunque este documento está centrado en pruebas del backend monolítico:

- La API de **auth** ya está lista para ser extraída a un microservicio dedicado.
- Puedes empezar a consumir estos endpoints desde otros servicios (Kafka, RabbitMQ, etc.)
  usando estos mismos JSON como contrato base.

Este `TESTS.md` está pensado como chuleta rápida para probar el backend en local o Docker sin tener que revisar todas las clases.
