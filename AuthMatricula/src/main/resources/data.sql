-- ================================
-- Datos iniciales para AUTH
-- Roles, permisos y asignaciones
-- ================================

-- ROLES BÁSICOS
INSERT INTO auth_role (nombre, descripcion) VALUES
  ('admin', 'administrador del sistema'),
  ('operador', 'operador académico'),
  ('estudiante', 'rol estudiante')
ON CONFLICT (nombre) DO NOTHING;

-- PERMISOS BÁSICOS
INSERT INTO auth_permission (nombre, descripcion) VALUES
  ('usuarios:CREATE', 'crear usuarios'),
  ('usuarios:READ',   'ver usuarios'),
  ('usuarios:UPDATE', 'editar usuarios'),
  ('usuarios:DELETE', 'eliminar usuarios'),
  ('roles:CREATE',    'crear roles'),
  ('roles:READ',      'ver roles'),
  ('roles:UPDATE',    'editar roles'),
  ('roles:DELETE',    'eliminar roles'),
  ('permisos:READ',   'ver permisos'),
  ('permisos:UPDATE', 'editar permisos'),
  ('cursos:CREATE',   'crear cursos'),
  ('cursos:READ',     'ver cursos'),
  ('cursos:UPDATE',   'editar cursos'),
  ('cursos:DELETE',   'eliminar cursos'),
  ('profesores:CREATE',   'crear profesores'),
  ('profesores:READ',     'ver profesores'),
  ('profesores:UPDATE',   'editar profesores'),
  ('profesores:DELETE',   'eliminar profesores'),
  ('secciones:CREATE',    'crear secciones'),
  ('secciones:READ',      'ver secciones'),
  ('secciones:UPDATE',    'editar secciones'),
  ('secciones:DELETE',    'eliminar secciones'),
  ('estudiantes:CREATE',  'crear estudiantes'),
  ('estudiantes:READ',    'ver estudiantes'),
  ('estudiantes:UPDATE',  'editar estudiantes'),
  ('estudiantes:DELETE',  'eliminar estudiantes'),
  ('matriculas:CREATE',   'crear matriculas'),
  ('matriculas:READ',     'ver matriculas'),
  ('matriculas:UPDATE',   'editar matriculas'),
  ('matriculas:DELETE',   'eliminar matriculas')
ON CONFLICT (nombre) DO NOTHING;

-- ASIGNAR PERMISOS A ROL ADMIN
INSERT INTO auth_role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM auth_role r, auth_permission p
WHERE r.nombre = 'admin'
  AND p.nombre IN (
    'usuarios:CREATE','usuarios:READ','usuarios:UPDATE','usuarios:DELETE',
    'roles:CREATE','roles:READ','roles:UPDATE','roles:DELETE',
    'permisos:READ','permisos:UPDATE',
    'cursos:CREATE','cursos:READ','cursos:UPDATE','cursos:DELETE',
    'profesores:CREATE','profesores:READ','profesores:UPDATE','profesores:DELETE',
    'secciones:CREATE','secciones:READ','secciones:UPDATE','secciones:DELETE',
    'estudiantes:CREATE','estudiantes:READ','estudiantes:UPDATE','estudiantes:DELETE',
    'matriculas:CREATE','matriculas:READ','matriculas:UPDATE','matriculas:DELETE'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ASIGNAR PERMISOS A ROL OPERADOR
INSERT INTO auth_role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM auth_role r, auth_permission p
WHERE r.nombre = 'operador'
  AND p.nombre IN (
    'cursos:CREATE','cursos:READ','cursos:UPDATE','cursos:DELETE',
    'profesores:CREATE','profesores:READ','profesores:UPDATE','profesores:DELETE',
    'secciones:CREATE','secciones:READ','secciones:UPDATE','secciones:DELETE',
    'estudiantes:CREATE','estudiantes:READ','estudiantes:UPDATE','estudiantes:DELETE',
    'matriculas:CREATE','matriculas:READ','matriculas:UPDATE','matriculas:DELETE'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ASIGNAR PERMISOS A ROL ESTUDIANTE
INSERT INTO auth_role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM auth_role r, auth_permission p
WHERE r.nombre = 'estudiante'
  AND p.nombre IN (
    'cursos:READ',
    'secciones:READ',
    'matriculas:READ'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;
