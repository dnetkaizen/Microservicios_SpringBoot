-- ============================================================
--   AUTH SERVICE - BASE DE DATOS PROPIA (COPIA SINCRONIZADA)
-- ============================================================

-- ===========================
-- TABLA: auth_user
-- ===========================
CREATE TABLE IF NOT EXISTS auth_user (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(200),
    firebase_uid VARCHAR(128) UNIQUE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- TABLA: auth_role
-- ===========================
CREATE TABLE IF NOT EXISTS auth_role (
    role_id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(200)
);

-- ===========================
-- TABLA: auth_permission
-- ===========================
CREATE TABLE IF NOT EXISTS auth_permission (
    permission_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion VARCHAR(200)
);

-- ===========================
-- TABLA: auth_user_role
-- ===========================
CREATE TABLE IF NOT EXISTS auth_user_role (
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY (user_id)
        REFERENCES auth_user(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_role FOREIGN KEY (role_id)
        REFERENCES auth_role(role_id) ON DELETE CASCADE,
    CONSTRAINT uk_user_role UNIQUE (user_id, role_id)
);

-- ===========================
-- TABLA: auth_role_permission
-- ===========================
CREATE TABLE IF NOT EXISTS auth_role_permission (
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    CONSTRAINT fk_role_perm_role FOREIGN KEY (role_id)
        REFERENCES auth_role(role_id) ON DELETE CASCADE,
    CONSTRAINT fk_role_perm_permission FOREIGN KEY (permission_id)
        REFERENCES auth_permission(permission_id) ON DELETE CASCADE,
    CONSTRAINT uk_role_permission UNIQUE (role_id, permission_id)
);

-- ===========================
-- ÍNDICES
-- ===========================
CREATE INDEX IF NOT EXISTS idx_auth_user_username ON auth_user(username);
CREATE INDEX IF NOT EXISTS idx_auth_user_email ON auth_user(email);
