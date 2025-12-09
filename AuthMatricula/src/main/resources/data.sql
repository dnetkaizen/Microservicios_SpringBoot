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
  ('cursos:DELETE',   'eliminar cursos')
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
    'cursos:CREATE','cursos:READ','cursos:UPDATE','cursos:DELETE'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ASIGNAR PERMISOS A ROL OPERADOR
INSERT INTO auth_role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM auth_role r, auth_permission p
WHERE r.nombre = 'operador'
  AND p.nombre IN (
    'cursos:CREATE','cursos:READ','cursos:UPDATE'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ASIGNAR PERMISOS A ROL ESTUDIANTE
INSERT INTO auth_role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM auth_role r, auth_permission p
WHERE r.nombre = 'estudiante'
  AND p.nombre IN ('cursos:READ')
ON CONFLICT (role_id, permission_id) DO NOTHING;
