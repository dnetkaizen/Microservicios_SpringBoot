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
import { Plus, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authorizedFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Usuario {
  id: string;
  username: string;
  email: string;
  roles: string[];
  estado: 'activo' | 'inactivo';
  ultimoAcceso: string;
}

interface AuthUserResponse {
  id: number;
  username: string;
  email: string;
  activo: boolean;
  fechaRegistro: string | null;
  roles: string[];
}

function formatFecha(fecha?: string | null): string {
  if (!fecha) return '-';
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return fecha;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function mapAuthUserToUsuario(user: AuthUserResponse): Usuario {
  return {
    id: String(user.id),
    username: user.username,
    email: user.email,
    roles: user.roles ? Array.from(user.roles) : [],
    estado: user.activo ? 'activo' : 'inactivo',
    ultimoAcceso: formatFecha(user.fechaRegistro),
  };
}

export default function Usuarios() {
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  const canRead = hasPermission('usuarios', 'READ');
  const canCreate = hasPermission('usuarios', 'CREATE');
  const canEdit = hasPermission('usuarios', 'UPDATE');
  const canDelete = hasPermission('usuarios', 'DELETE');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUsuarios = async () => {
      setIsLoading(true);
      try {
        const response = await authorizedFetch('/auth/users');
        if (!response.ok) {
          throw new Error('Error al cargar usuarios');
        }
        const usuariosDto: AuthUserResponse[] = await response.json();
        const usuarios = usuariosDto.map(mapAuthUserToUsuario);
        setUsuarios(usuarios);
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los usuarios',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsuarios();
  }, []);

  const columns: Column<Usuario>[] = [
    { key: 'username', header: 'Usuario' },
    { key: 'email', header: 'Email' },
    {
      key: 'roles',
      header: 'Roles',
      render: (user) => (
        <div className="flex gap-1 flex-wrap">
          {user.roles.map((role) => (
            <Badge key={role} variant="secondary" className="text-xs">
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (user) => (
        <Badge variant={user.estado === 'activo' ? 'default' : 'secondary'}>
          {user.estado}
        </Badge>
      ),
    },
    { key: 'ultimoAcceso', header: 'Último Acceso' },
  ];

  const handleView = (user: Usuario) => {
    toast({
      title: 'Ver usuario',
      description: `Detalles de ${user.username}`,
    });
  };

  const handleEdit = (user: Usuario) => {
    setEditingUser(user);
    setFormUsername(user.username);
    setFormEmail(user.email);
    setIsDialogOpen(true);
  };

  const handleDelete = async (user: Usuario) => {
    try {
      const response = await authorizedFetch(`/auth/users/${user.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error al eliminar usuario');
      }
      setUsuarios(usuarios.filter((u) => u.id !== user.id));
      toast({
        title: 'Usuario eliminado',
        description: `${user.username} ha sido eliminado correctamente`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el usuario',
      });
    }
  };

  const handleSave = async () => {
    if (!formUsername.trim() || !formEmail.trim()) {
      toast({
        title: 'Datos incompletos',
        description: 'Debes ingresar usuario y email',
      });
      return;
    }

    try {
      if (editingUser) {
        const body = JSON.stringify({
          username: formUsername,
          email: formEmail,
          activo: editingUser.estado === 'activo',
        });
        const response = await authorizedFetch(`/auth/users/${editingUser.id}`, {
          method: 'PUT',
          body,
        });
        if (!response.ok) {
          throw new Error('Error al actualizar usuario');
        }
        const updatedDto: AuthUserResponse = await response.json();
        const updated = mapAuthUserToUsuario(updatedDto);
        setUsuarios((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        toast({
          title: 'Usuario actualizado',
          description: 'Los cambios se han guardado correctamente',
        });
      } else {
        const body = JSON.stringify({
          username: formUsername,
          email: formEmail,
        });
        const response = await authorizedFetch('/auth/users', {
          method: 'POST',
          body,
        });
        if (!response.ok) {
          throw new Error('Error al crear usuario');
        }
        const createdDto: AuthUserResponse = await response.json();
        const created = mapAuthUserToUsuario(createdDto);
        setUsuarios((prev) => [...prev, created]);
        toast({
          title: 'Usuario creado',
          description: 'Los cambios se han guardado correctamente',
        });
      }

      setIsDialogOpen(false);
      setEditingUser(null);
      setFormUsername('');
      setFormEmail('');
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
          No tienes permisos para ver la gestión de usuarios.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Gestión de Usuarios"
        description="Administra los usuarios del sistema y sus roles asignados"
        actions={
          canCreate ? (
            <Button
              onClick={() => {
                setEditingUser(null);
                setFormUsername('');
                setFormEmail('');
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nuevo Usuario
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando usuarios...</p>
      ) : (
        <DataTable
          data={usuarios}
          columns={columns}
          searchKey="email"
          searchPlaceholder="Buscar por email..."
          onView={handleView}
          onEdit={canEdit ? handleEdit : undefined}
          onDelete={canDelete ? handleDelete : undefined}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Modifica los datos del usuario'
                : 'Ingresa los datos del nuevo usuario'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input
                id="username"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                placeholder="usuario123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="usuario@universidad.edu"
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
