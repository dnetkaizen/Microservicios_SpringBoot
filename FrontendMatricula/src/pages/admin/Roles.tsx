import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authorizedFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface AuthRoleResponse {
  id: number;
  nombre: string;
  descripcion: string;
  permisos: string[];
}

interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisosCount: number;
}

function mapAuthRoleToRol(role: AuthRoleResponse): Rol {
  return {
    id: String(role.id),
    nombre: role.nombre,
    descripcion: role.descripcion,
    permisosCount: role.permisos ? role.permisos.length : 0,
  };
}

export default function Roles() {
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  const canRead = hasPermission('roles', 'READ');
  const canCreate = hasPermission('roles', 'CREATE');
  const canEdit = hasPermission('roles', 'UPDATE');
  const canDelete = hasPermission('roles', 'DELETE');
  const [roles, setRoles] = useState<Rol[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Rol | null>(null);
  const [formNombre, setFormNombre] = useState('');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoading(true);
      try {
        const response = await authorizedFetch('/auth/roles');
        if (!response.ok) {
          throw new Error('Error al cargar roles');
        }
        const data: AuthRoleResponse[] = await response.json();
        setRoles(data.map(mapAuthRoleToRol));
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los roles',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const columns: Column<Rol>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (rol) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="font-medium">{rol.nombre}</span>
        </div>
      ),
    },
    { key: 'descripcion', header: 'Descripción' },
    {
      key: 'permisosCount',
      header: 'Permisos',
      render: (rol) => (
        <Badge variant="secondary">{rol.permisosCount} permisos</Badge>
      ),
    },
  ];

  const handleEdit = (rol: Rol) => {
    setEditingRole(rol);
    setFormNombre(rol.nombre);
    setFormDescripcion(rol.descripcion ?? '');
    setIsDialogOpen(true);
  };

  const handleDelete = async (rol: Rol) => {
    try {
      const response = await authorizedFetch(`/auth/roles/${rol.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error al eliminar rol');
      }
      setRoles(roles.filter((r) => r.id !== rol.id));
      toast({
        title: 'Rol eliminado',
        description: `${rol.nombre} ha sido eliminado correctamente`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el rol',
      });
    }
  };

  const handleSave = async () => {
    if (!formNombre.trim()) {
      toast({
        title: 'Datos incompletos',
        description: 'Debes ingresar el nombre del rol',
      });
      return;
    }

    try {
      if (editingRole) {
        const body = JSON.stringify({
          nombre: formNombre,
          descripcion: formDescripcion,
        });
        const response = await authorizedFetch(`/auth/roles/${editingRole.id}`, {
          method: 'PUT',
          body,
        });
        if (!response.ok) {
          throw new Error('Error al actualizar rol');
        }
        const updatedDto: AuthRoleResponse = await response.json();
        const updated = mapAuthRoleToRol(updatedDto);
        setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        toast({
          title: 'Rol actualizado',
          description: 'Los cambios se han guardado correctamente',
        });
      } else {
        const body = JSON.stringify({
          nombre: formNombre,
          descripcion: formDescripcion,
        });
        const response = await authorizedFetch('/auth/roles', {
          method: 'POST',
          body,
        });
        if (!response.ok) {
          throw new Error('Error al crear rol');
        }
        const createdDto: AuthRoleResponse = await response.json();
        const created = mapAuthRoleToRol(createdDto);
        setRoles((prev) => [...prev, created]);
        toast({
          title: 'Rol creado',
          description: 'Los cambios se han guardado correctamente',
        });
      }

      setIsDialogOpen(false);
      setEditingRole(null);
      setFormNombre('');
      setFormDescripcion('');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios',
      });
    }
  };

  if (!canRead) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">
          No tienes permisos para ver la gestión de roles.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Gestión de Roles"
        description="Administra los roles del sistema y sus permisos asociados"
        actions={
          canCreate ? (
            <Button
              onClick={() => {
                setEditingRole(null);
                setFormNombre('');
                setFormDescripcion('');
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nuevo Rol
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando roles...</p>
      ) : (
        <DataTable
          data={roles}
          columns={columns}
          searchKey="nombre"
          searchPlaceholder="Buscar rol..."
          onEdit={canEdit ? handleEdit : undefined}
          onDelete={canDelete ? handleDelete : undefined}
          canView={false}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? 'Modifica los datos del rol'
                : 'Ingresa los datos del nuevo rol'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del rol</Label>
              <Input
                id="nombre"
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
                placeholder="NOMBRE_ROL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formDescripcion}
                onChange={(e) => setFormDescripcion(e.target.value)}
                placeholder="Descripción del rol..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
