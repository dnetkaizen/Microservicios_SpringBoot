-- ============================================================
--      SISTEMA DE MATRÍCULA + SISTEMA DE AUTH (MASTER)
--      BASE DE DATOS GENERAL DEL BACKEND
-- ============================================================


-- ============================================================
--                    TABLAS AUTH (MASTER)
-- ============================================================

-- ===========================
-- TABLA: auth_user
-- ===========================
CREATE TABLE IF NOT EXISTS auth_user (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
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
-- TABLA: auth_user_role (Many-to-Many)
-- ===========================
CREATE TABLE IF NOT EXISTS auth_user_role (
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id)
        REFERENCES auth_user(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id)
        REFERENCES auth_role(role_id) ON DELETE CASCADE,
    CONSTRAINT uk_user_role UNIQUE (user_id, role_id)
);

-- ===========================
-- TABLA: auth_role_permission (Many-to-Many)
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
-- ÍNDICES AUTH
-- ===========================
CREATE INDEX IF NOT EXISTS idx_auth_user_username ON auth_user(username);
CREATE INDEX IF NOT EXISTS idx_auth_user_email ON auth_user(email);
CREATE INDEX IF NOT EXISTS idx_auth_user_role ON auth_user_role(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_role_perm ON auth_role_permission(role_id);



-- ============================================================
--                 TABLAS DEL SISTEMA DE MATRÍCULA
-- ============================================================

-- ===========================
-- TABLA: estudiante
-- ===========================
CREATE TABLE IF NOT EXISTS estudiante (
    estudiante_id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    dni VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    fecha_nacimiento DATE NOT NULL,
    direccion VARCHAR(200),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- ===========================
-- TABLA: profesor
-- ===========================
CREATE TABLE IF NOT EXISTS profesor (
    profesor_id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    dni VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    especialidad VARCHAR(100),
    titulo_academico VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- ===========================
-- TABLA: curso
-- ===========================
CREATE TABLE IF NOT EXISTS curso (
    curso_id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    creditos INTEGER NOT NULL,
    nivel_semestre INTEGER NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    CONSTRAINT ck_creditos CHECK (creditos > 0),
    CONSTRAINT ck_nivel_semestre CHECK (nivel_semestre > 0)
);

-- ===========================
-- TABLA: seccion
-- ===========================
CREATE TABLE IF NOT EXISTS seccion (
    seccion_id SERIAL PRIMARY KEY,
    curso_id INTEGER NOT NULL,
    profesor_id INTEGER NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    capacidad_maxima INTEGER NOT NULL,
    aula VARCHAR(50),
    horario VARCHAR(50),
    dias VARCHAR(50),
    periodo_academico VARCHAR(20) NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_seccion_curso FOREIGN KEY (curso_id)
        REFERENCES curso(curso_id) ON DELETE RESTRICT,

    CONSTRAINT fk_seccion_profesor FOREIGN KEY (profesor_id)
        REFERENCES profesor(profesor_id) ON DELETE RESTRICT,

    CONSTRAINT uk_seccion_periodo UNIQUE (curso_id, codigo, periodo_academico),
    CONSTRAINT ck_capacidad_maxima CHECK (capacidad_maxima > 0)
);

-- ===========================
-- TABLA: matricula
-- ===========================
CREATE TABLE IF NOT EXISTS matricula (
    matricula_id SERIAL PRIMARY KEY,
    estudiante_id INTEGER NOT NULL,
    seccion_id INTEGER NOT NULL,
    fecha_matricula DATE NOT NULL DEFAULT CURRENT_DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    costo NUMERIC(10, 2) NOT NULL,
    metodo_pago VARCHAR(50),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_matricula_estudiante FOREIGN KEY (estudiante_id)
        REFERENCES estudiante(estudiante_id) ON DELETE RESTRICT,

    CONSTRAINT fk_matricula_seccion FOREIGN KEY (seccion_id)
        REFERENCES seccion(seccion_id) ON DELETE RESTRICT,

    CONSTRAINT uk_matricula UNIQUE (estudiante_id, seccion_id),

    CONSTRAINT ck_estado CHECK (estado IN ('PENDIENTE', 'PAGADO', 'ANULADO', 'COMPLETADO')),
    CONSTRAINT ck_costo CHECK (costo >= 0)
);


-- ===========================
-- ÍNDICES MATRÍCULA
-- ===========================
CREATE INDEX IF NOT EXISTS idx_estudiante_apellido ON estudiante(apellido);
CREATE INDEX IF NOT EXISTS idx_profesor_apellido ON profesor(apellido);
CREATE INDEX IF NOT EXISTS idx_curso_nombre ON curso(nombre);
CREATE INDEX IF NOT EXISTS idx_curso_codigo ON curso(codigo);
CREATE INDEX IF NOT EXISTS idx_seccion_curso ON seccion(curso_id);
CREATE INDEX IF NOT EXISTS idx_seccion_profesor ON seccion(profesor_id);
CREATE INDEX IF NOT EXISTS idx_matricula_estudiante ON matricula(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_matricula_seccion ON matricula(seccion_id);
