# Pruebas del microservicio auth-service (AuthMatricula)

Este documento contiene ejemplos de pruebas para el microservicio `auth-service` que corre por defecto en `http://localhost:8087`.

Puedes usar Postman, Insomnia o cURL.

---

## 1. Registro de usuario

### 1.1. Request

- **Método**: `POST`
- **URL**: `http://localhost:8087/api/auth/register`
- **Headers**:
  - `Content-Type: application/json`

### JSON ejemplo

```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "Admin1234!"
}
```

### cURL

```bash
curl -X POST "http://localhost:8087/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "Admin1234!"
  }'
```

Respuesta esperada: `201 Created` con cuerpo `AuthUserResponseDto`.

---

## 2. Login

### 2.1. Request

- **Método**: `POST`
- **URL**: `http://localhost:8087/api/auth/login`
- **Headers**:
  - `Content-Type: application/json`

### JSON ejemplo

```json
{
  "usernameOrEmail": "admin",
  "password": "Admin1234!"
}
```

### cURL

```bash
curl -X POST "http://localhost:8087/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "admin",
    "password": "Admin1234!"
  }'
```

Respuesta esperada (`200 OK`):

```json
{
  "token": "<JWT>",
  "type": "Bearer",
  "username": "admin",
  "email": "admin@example.com",
  "roles": []
}
```

Guarda el valor de `token` para las siguientes pruebas.

---

## 3. Obtener usuario actual (/me)

### 3.1. Request

- **Método**: `GET`
- **URL**: `http://localhost:8087/api/auth/me`
- **Headers**:
  - `Authorization: Bearer <JWT>`

### cURL

```bash
curl -X GET "http://localhost:8087/api/auth/me" \
  -H "Authorization: Bearer <JWT>"
```

Respuesta esperada (`200 OK`): `AuthUserResponseDto` del usuario logueado.

---

## 4. CRUD de permisos

### 4.1. Crear permiso

- **Método**: `POST`
- **URL**: `http://localhost:8087/api/auth/permissions`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT>`

```json
{
  "nombre": "USER_READ",
  "descripcion": "Permite leer información de usuarios"
}
```

```bash
curl -X POST "http://localhost:8087/api/auth/permissions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{
    "nombre": "USER_READ",
    "descripcion": "Permite leer información de usuarios"
  }'
```

### 4.2. Listar permisos

```bash
curl -X GET "http://localhost:8087/api/auth/permissions" \
  -H "Authorization: Bearer <JWT>"
```

### 4.3. Obtener permiso por id

```bash
curl -X GET "http://localhost:8087/api/auth/permissions/1" \
  -H "Authorization: Bearer <JWT>"
```

### 4.4. Actualizar permiso

```bash
curl -X PUT "http://localhost:8087/api/auth/permissions/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{
    "nombre": "USER_READ_ALL",
    "descripcion": "Permite leer todos los usuarios"
  }'
```

### 4.5. Eliminar permiso

```bash
curl -X DELETE "http://localhost:8087/api/auth/permissions/1" \
  -H "Authorization: Bearer <JWT>"
```

---

## 5. CRUD de roles y asignación de permisos

### 5.1. Crear rol

- **Método**: `POST`
- **URL**: `http://localhost:8087/api/auth/roles`

```json
{
  "nombre": "ADMIN",
  "descripcion": "Rol administrador del sistema"
}
```

```bash
curl -X POST "http://localhost:8087/api/auth/roles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{
    "nombre": "ADMIN",
    "descripcion": "Rol administrador del sistema"
  }'
```

### 5.2. Listar roles

```bash
curl -X GET "http://localhost:8087/api/auth/roles" \
  -H "Authorization: Bearer <JWT>"
```

### 5.3. Asignar permiso a rol

Suponiendo `roleId = 1` y `permissionId = 1`:

```bash
curl -X POST "http://localhost:8087/api/auth/roles/1/permissions/1" \
  -H "Authorization: Bearer <JWT>"
```

### 5.4. Remover permiso de rol

```bash
curl -X DELETE "http://localhost:8087/api/auth/roles/1/permissions/1" \
  -H "Authorization: Bearer <JWT>"
```

### 5.5. Actualizar rol

```bash
curl -X PUT "http://localhost:8087/api/auth/roles/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{
    "nombre": "SUPER_ADMIN",
    "descripcion": "Rol administrador global"
  }'
```

### 5.6. Eliminar rol

```bash
curl -X DELETE "http://localhost:8087/api/auth/roles/1" \
  -H "Authorization: Bearer <JWT>"
```

---

## 6. CRUD de usuarios y asignación de roles

> Nota: además de `/api/auth/register`, tienes CRUD de usuarios de administración en `/api/auth/users`.

### 6.1. Crear usuario

```bash
curl -X POST "http://localhost:8087/api/auth/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{
    "username": "usuario1",
    "email": "usuario1@example.com",
    "password": "Usuario1234!",
    "activo": true
  }'
```

### 6.2. Listar usuarios

```bash
curl -X GET "http://localhost:8087/api/auth/users" \
  -H "Authorization: Bearer <JWT>"
```

### 6.3. Obtener usuario por id

```bash
curl -X GET "http://localhost:8087/api/auth/users/1" \
  -H "Authorization: Bearer <JWT>"
```

### 6.4. Actualizar usuario

```bash
curl -X PUT "http://localhost:8087/api/auth/users/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{
    "username": "usuario1_mod",
    "email": "usuario1_mod@example.com",
    "password": "Usuario1234!",
    "activo": true
  }'
```

### 6.5. Asignar rol a usuario

Suponiendo `userId = 1` y `roleId = 1`:

```bash
curl -X POST "http://localhost:8087/api/auth/users/1/roles/1" \
  -H "Authorization: Bearer <JWT>"
```

### 6.6. Remover rol de usuario

```bash
curl -X DELETE "http://localhost:8087/api/auth/users/1/roles/1" \
  -H "Authorization: Bearer <JWT>"
```

### 6.7. Eliminar usuario

```bash
curl -X DELETE "http://localhost:8087/api/auth/users/1" \
  -H "Authorization: Bearer <JWT>"
```

---

## 7. Resumen de flujo completo

1. Levantar BD y microservicio (local o Docker).
2. Registrar un usuario administrador con `/api/auth/register`.
3. Loguear con `/api/auth/login` y obtener el JWT.
4. Con ese JWT, crear permisos y roles.
5. Asignar permisos a roles.
6. Crear usuarios adicionales vía `/api/auth/users`.
7. Asignar roles a usuarios.
8. Usar `/api/auth/me` en el frontend para obtener los datos del usuario autenticado.

Con estos ejemplos tienes cubierto el ciclo completo de autenticación/autorización del microservicio `auth-service`.
