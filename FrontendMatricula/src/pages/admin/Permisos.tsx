import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Save, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authorizedFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const recursos = [
  { id: 'usuarios', nombre: 'Usuarios' },
  { id: 'roles', nombre: 'Roles' },
  { id: 'permisos', nombre: 'Permisos' },
  { id: 'cursos', nombre: 'Cursos' },
  { id: 'profesores', nombre: 'Profesores' },
  { id: 'secciones', nombre: 'Secciones' },
  { id: 'estudiantes', nombre: 'Estudiantes' },
  { id: 'matriculas', nombre: 'Matrículas' },
];

const operaciones = ['CREATE', 'READ', 'UPDATE', 'DELETE'];

interface AuthRoleResponse {
  id: number;
  nombre: string;
  descripcion: string;
  permisos: string[];
}

interface AuthPermissionResponse {
  id: number;
  nombre: string;
  descripcion: string;
}

type PermisosMatrix = Record<string, Record<string, boolean>>;

function buildEmptyMatrix(): PermisosMatrix {
  const matrix: PermisosMatrix = {};
  for (const recurso of recursos) {
    matrix[recurso.id] = {};
    for (const op of operaciones) {
      matrix[recurso.id][op] = false;
    }
  }
  return matrix;
}

function permissionNameFromMatrix(recursoId: string, operacion: string): string {
  return `${recursoId}:${operacion}`;
}

function parsePermissionName(nombre: string): { recursoId: string; operacion: string } | null {
  const parts = nombre.split(':');
  if (parts.length !== 2) return null;
  return { recursoId: parts[0], operacion: parts[1] };
}

export default function Permisos() {
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  const canRead = hasPermission('permisos', 'READ');
  const canUpdate = hasPermission('permisos', 'UPDATE');
  const [roles, setRoles] = useState<AuthRoleResponse[]>([]);
  const [permissions, setPermissions] = useState<AuthPermissionResponse[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [permisos, setPermisos] = useState<PermisosMatrix>(() => buildEmptyMatrix());
  const [isLoading, setIsLoading] = useState(false);

  function buildMatrixForRole(role: AuthRoleResponse): PermisosMatrix {
    const matrix = buildEmptyMatrix();
    if (!role.permisos) {
      return matrix;
    }

    for (const nombre of role.permisos) {
      const parsed = parsePermissionName(nombre);
      if (!parsed) continue;
      const { recursoId, operacion } = parsed;
      if (matrix[recursoId] && matrix[recursoId][operacion] !== undefined) {
        matrix[recursoId][operacion] = true;
      }
    }

    return matrix;
  }

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [rolesRes, permsRes] = await Promise.all([
          authorizedFetch('/auth/roles'),
          authorizedFetch('/auth/permissions'),
        ]);

        if (!rolesRes.ok || !permsRes.ok) {
          throw new Error('Error al cargar roles/permisos');
        }

        const rolesDto: AuthRoleResponse[] = await rolesRes.json();
        const permsDto: AuthPermissionResponse[] = await permsRes.json();

        setRoles(rolesDto);
        setPermissions(permsDto);

        if (rolesDto.length > 0) {
          const firstId = String(rolesDto[0].id);
          setSelectedRole(firstId);
          setPermisos(buildMatrixForRole(rolesDto[0]));
        }
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar roles y permisos',
        });
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const handleSelectRole = (value: string) => {
    setSelectedRole(value);
    const role = roles.find((r) => String(r.id) === value);
    if (role) {
      setPermisos(buildMatrixForRole(role));
    } else {
      setPermisos(buildEmptyMatrix());
    }
  };

  const handlePermissionChange = async (recurso: string, operacion: string, checked: boolean) => {
    if (!canUpdate) {
      toast({
        title: 'Permiso insuficiente',
        description: 'No tienes permisos para modificar permisos de roles',
      });
      return;
    }
    if (!selectedRole) {
      toast({
        title: 'Selecciona un rol',
        description: 'Debes seleccionar un rol antes de modificar permisos',
      });
      return;
    }

    setPermisos((prev) => ({
      ...prev,
      [recurso]: {
        ...prev[recurso],
        [operacion]: checked,
      },
    }));

    const roleId = Number(selectedRole);
    const permName = permissionNameFromMatrix(recurso, operacion);
    const permission = permissions.find((p) => p.nombre === permName);

    if (!permission) {
      toast({
        title: 'Permiso no definido',
        description: `No existe un permiso con nombre ${permName} en el backend`,
      });
      setPermisos((prev) => ({
        ...prev,
        [recurso]: {
          ...prev[recurso],
          [operacion]: !checked,
        },
      }));
      return;
    }

    try {
      const method = checked ? 'POST' : 'DELETE';
      const response = await authorizedFetch(`/auth/roles/${roleId}/permissions/${permission.id}`, {
        method,
      });

      if (!response.ok) {
        throw new Error('Error al actualizar permiso');
      }

      const updatedRole: AuthRoleResponse = await response.json();
      setRoles((prev) => prev.map((r) => (r.id === updatedRole.id ? updatedRole : r)));

      if (String(updatedRole.id) === selectedRole) {
        setPermisos(buildMatrixForRole(updatedRole));
      }
    } catch (error) {
      console.error(error);
      setPermisos((prev) => ({
        ...prev,
        [recurso]: {
          ...prev[recurso],
          [operacion]: !checked,
        },
      }));
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el permiso',
      });
    }
  };

  const handleSave = () => {
    toast({
      title: 'Permisos guardados',
      description: 'La matriz de permisos se ha actualizado correctamente',
    });
  };

  if (!canRead) {
    return (
      <div className="p-4">
        <PageHeader
          title="Matriz de Permisos"
          description="No tienes permisos para ver esta sección."
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Matriz de Permisos"
        description="Configura los permisos de cada rol sobre los recursos del sistema"
        actions={
          <Button onClick={handleSave}>
            <Save className="h-4 w-4" />
            Guardar Cambios
          </Button>
        }
      />

      {isLoading && (
        <p className="mb-4 text-sm text-muted-foreground">
          Cargando roles y permisos...
        </p>
      )}

      <Card className="border-border shadow-soft mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Seleccionar Rol
          </CardTitle>
          <CardDescription>
            Elige el rol para configurar sus permisos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedRole} onValueChange={handleSelectRole}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((rol) => (
                <SelectItem key={rol.id} value={String(rol.id)}>
                  {rol.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-border shadow-soft">
        <CardHeader>
          <CardTitle>Permisos por Recurso</CardTitle>
          <CardDescription>
            Marca las operaciones permitidas para cada recurso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-muted-foreground">
                    Recurso
                  </th>
                  {operaciones.map((op) => (
                    <th
                      key={op}
                      className="py-3 px-4 text-center text-sm font-semibold text-muted-foreground"
                    >
                      {op}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recursos.map((recurso) => (
                  <tr
                    key={recurso.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-foreground">
                      {recurso.nombre}
                    </td>
                    {operaciones.map((op) => (
                      <td key={op} className="py-4 px-4 text-center">
                        <Checkbox
                          checked={permisos[recurso.id]?.[op] ?? false}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(recurso.id, op, checked as boolean)
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
