import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Plus, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authorizedFetch } from '@/lib/api';

interface Profesor {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono?: string;
  especialidad?: string;
  tituloAcademico?: string;
  estado: 'activo' | 'inactivo';
}

interface ProfesorResponseDto {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string | null;
  especialidad: string | null;
  tituloAcademico: string | null;
  fechaRegistro: string | null;
  activo: boolean;
}

export default function Profesores() {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfesor, setEditingProfesor] = useState<Profesor | null>(null);

  const [formNombres, setFormNombres] = useState('');
  const [formApellidos, setFormApellidos] = useState('');
  const [formDni, setFormDni] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [formEspecialidad, setFormEspecialidad] = useState('');
  const [formTitulo, setFormTitulo] = useState('');

  const canRead = hasPermission('profesores', 'READ');
  const canCreate = hasPermission('profesores', 'CREATE');
  const canEdit = hasPermission('profesores', 'UPDATE');
  const canDelete = hasPermission('profesores', 'DELETE');

  const mapDtoToProfesor = (dto: ProfesorResponseDto): Profesor => ({
    id: String(dto.id),
    nombres: dto.nombre,
    apellidos: dto.apellido,
    dni: dto.dni,
    email: dto.email,
    telefono: dto.telefono ?? '',
    especialidad: dto.especialidad ?? '',
    tituloAcademico: dto.tituloAcademico ?? '',
    estado: dto.activo ? 'activo' : 'inactivo',
  });

  const loadProfesores = async () => {
    if (!canRead) return;
    try {
      const response = await authorizedFetch('/profesores');
      if (!response.ok) {
        throw new Error('Error al cargar profesores');
      }
      const data: ProfesorResponseDto[] = await response.json();
      setProfesores(data.map(mapDtoToProfesor));
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los profesores',
      });
    }
  };

  useEffect(() => {
    loadProfesores();
  }, [canRead]);

  const columns: Column<Profesor>[] = [
    {
      key: 'nombres',
      header: 'Profesor',
      render: (profesor) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {profesor.nombres.charAt(0)}{profesor.apellidos.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{profesor.nombres} {profesor.apellidos}</p>
            <p className="text-xs text-muted-foreground">{profesor.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'especialidad',
      header: 'Especialidad',
      render: (profesor) => (
        <Badge variant="secondary">{profesor.especialidad}</Badge>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (profesor) => (
        <Badge variant={profesor.estado === 'activo' ? 'default' : 'secondary'}>
          {profesor.estado}
        </Badge>
      ),
    },
  ];

  const handleEdit = (profesor: Profesor) => {
    setEditingProfesor(profesor);
    setFormNombres(profesor.nombres);
    setFormApellidos(profesor.apellidos);
    setFormDni(profesor.dni);
    setFormEmail(profesor.email);
    setFormTelefono(profesor.telefono ?? '');
    setFormEspecialidad(profesor.especialidad ?? '');
    setFormTitulo(profesor.tituloAcademico ?? '');
    setIsDialogOpen(true);
  };

  const handleDelete = (profesor: Profesor) => {
    if (!canDelete) return;

    const deleteProfesor = async () => {
      try {
        const response = await authorizedFetch(`/profesores/${profesor.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Error al eliminar profesor');
        }
        setProfesores((prev) => prev.filter((p) => p.id !== profesor.id));
        toast({
          title: 'Profesor eliminado',
          description: `${profesor.nombres} ${profesor.apellidos} ha sido eliminado correctamente`,
        });
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el profesor',
        });
      }
    };

    void deleteProfesor();
  };

  const handleSave = () => {
    if (!formNombres.trim() || !formApellidos.trim() || !formDni.trim() || !formEmail.trim()) {
      toast({
        title: 'Datos incompletos',
        description: 'Debes ingresar nombres, apellidos, DNI y email',
      });
      return;
    }

    const body = JSON.stringify({
      nombre: formNombres,
      apellido: formApellidos,
      dni: formDni,
      email: formEmail,
      telefono: formTelefono || null,
      especialidad: formEspecialidad || null,
      tituloAcademico: formTitulo || null,
      activo: true,
    });

    const save = async () => {
      try {
        if (editingProfesor) {
          if (!canEdit) return;
          const response = await authorizedFetch(`/profesores/${editingProfesor.id}`, {
            method: 'PUT',
            body,
          });
          if (!response.ok) {
            throw new Error('Error al actualizar profesor');
          }
        } else {
          if (!canCreate) return;
          const response = await authorizedFetch('/profesores', {
            method: 'POST',
            body,
          });
          if (!response.ok) {
            throw new Error('Error al crear profesor');
          }
        }

        await loadProfesores();

        toast({
          title: editingProfesor ? 'Profesor actualizado' : 'Profesor creado',
          description: 'Los cambios se han guardado correctamente',
        });

        setIsDialogOpen(false);
        setEditingProfesor(null);
        setFormNombres('');
        setFormApellidos('');
        setFormDni('');
        setFormEmail('');
        setFormTelefono('');
        setFormEspecialidad('');
        setFormTitulo('');
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'No se pudieron guardar los cambios',
        });
      }
    };

    void save();
  };

  if (!canRead) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">
          No tienes permisos para ver esta sección.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Gestión de Profesores"
        description="Administra el directorio de profesores de la universidad"
        actions={
          canCreate && (
            <Button
              onClick={() => {
                setEditingProfesor(null);
                setFormNombres('');
                setFormApellidos('');
                setFormDni('');
                setFormEmail('');
                setFormTelefono('');
                setFormEspecialidad('');
                setFormTitulo('');
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nuevo Profesor
            </Button>
          )
        }
      />

      <DataTable
        data={profesores}
        columns={columns}
        searchKey="apellidos"
        searchPlaceholder="Buscar por apellido..."
        onEdit={canEdit ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
        canEdit={canEdit}
        canDelete={canDelete}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              {editingProfesor ? 'Editar Profesor' : 'Nuevo Profesor'}
            </DialogTitle>
            <DialogDescription>
              {editingProfesor
                ? 'Modifica los datos del profesor'
                : 'Ingresa los datos del nuevo profesor'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombres">Nombres</Label>
                <Input
                  id="nombres"
                  value={formNombres}
                  onChange={(e) => setFormNombres(e.target.value)}
                  placeholder="Roberto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input
                  id="apellidos"
                  value={formApellidos}
                  onChange={(e) => setFormApellidos(e.target.value)}
                  placeholder="López García"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  value={formDni}
                  onChange={(e) => setFormDni(e.target.value)}
                  placeholder="12345678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formTelefono}
                  onChange={(e) => setFormTelefono(e.target.value)}
                  placeholder="999999999"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="profesor@universidad.edu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="especialidad">Especialidad</Label>
              <Input
                id="especialidad"
                value={formEspecialidad}
                onChange={(e) => setFormEspecialidad(e.target.value)}
                placeholder="Matemáticas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titulo">Título académico</Label>
              <Input
                id="titulo"
                value={formTitulo}
                onChange={(e) => setFormTitulo(e.target.value)}
                placeholder="Dr. / Mg. / Lic."
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
