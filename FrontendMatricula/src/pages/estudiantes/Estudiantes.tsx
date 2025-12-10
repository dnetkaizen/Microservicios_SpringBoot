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
import { Plus, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authorizedFetch } from '@/lib/api';

interface Estudiante {
  id: string;
  codigo: string;
  nombres: string;
  apellidos: string;
  email: string;
  carrera: string;
  estado: 'activo' | 'inactivo' | 'egresado';
}

interface EstudianteResponseDto {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string | null;
  fechaNacimiento: string | null;
  direccion: string | null;
  fechaRegistro: string | null;
  activo: boolean;
}

export default function Estudiantes() {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEstudiante, setEditingEstudiante] = useState<Estudiante | null>(null);

  const [formCodigo, setFormCodigo] = useState('');
  const [formCarrera, setFormCarrera] = useState('');
  const [formNombres, setFormNombres] = useState('');
  const [formApellidos, setFormApellidos] = useState('');
  const [formEmail, setFormEmail] = useState('');

  const canRead = hasPermission('estudiantes', 'READ');
  const canCreate = hasPermission('estudiantes', 'CREATE');
  const canEdit = hasPermission('estudiantes', 'UPDATE');
  const canDelete = hasPermission('estudiantes', 'DELETE');

  const mapDtoToEstudiante = (dto: EstudianteResponseDto): Estudiante => ({
    id: String(dto.id),
    codigo: dto.dni,
    nombres: dto.nombre,
    apellidos: dto.apellido,
    email: dto.email,
    carrera: dto.direccion ?? '',
    estado: dto.activo ? 'activo' : 'inactivo',
  });

  const loadEstudiantes = async () => {
    if (!canRead) return;
    try {
      const response = await authorizedFetch('/estudiantes');
      if (!response.ok) {
        throw new Error('Error al cargar estudiantes');
      }
      const data: EstudianteResponseDto[] = await response.json();
      setEstudiantes(data.map(mapDtoToEstudiante));
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los estudiantes',
      });
    }
  };

  useEffect(() => {
    void loadEstudiantes();
  }, [canRead]);

  const columns: Column<Estudiante>[] = [
    {
      key: 'codigo',
      header: 'Código',
      render: (estudiante) => (
        <span className="font-mono font-medium text-primary">{estudiante.codigo}</span>
      ),
    },
    {
      key: 'nombres',
      header: 'Estudiante',
      render: (estudiante) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {estudiante.nombres.charAt(0)}{estudiante.apellidos.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{estudiante.nombres} {estudiante.apellidos}</p>
            <p className="text-xs text-muted-foreground">{estudiante.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'carrera',
      header: 'Carrera',
      render: (estudiante) => (
        <span className="text-sm">{estudiante.carrera}</span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (estudiante) => (
        <Badge
          variant={
            estudiante.estado === 'activo'
              ? 'default'
              : estudiante.estado === 'egresado'
              ? 'secondary'
              : 'outline'
          }
        >
          {estudiante.estado}
        </Badge>
      ),
    },
  ];

  const handleEdit = (estudiante: Estudiante) => {
    setEditingEstudiante(estudiante);
    setFormCodigo(estudiante.codigo);
    setFormCarrera(estudiante.carrera);
    setFormNombres(estudiante.nombres);
    setFormApellidos(estudiante.apellidos);
    setFormEmail(estudiante.email);
    setIsDialogOpen(true);
  };

  const handleDelete = (estudiante: Estudiante) => {
    if (!canDelete) return;

    const deleteEstudiante = async () => {
      try {
        const response = await authorizedFetch(`/estudiantes/${estudiante.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Error al eliminar estudiante');
        }
        setEstudiantes((prev) => prev.filter((e) => e.id !== estudiante.id));
        toast({
          title: 'Estudiante eliminado',
          description: `${estudiante.nombres} ${estudiante.apellidos} ha sido eliminado correctamente`,
        });
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el estudiante',
        });
      }
    };

    void deleteEstudiante();
  };

  const handleSave = () => {
    if (!formCodigo.trim() || !formNombres.trim() || !formApellidos.trim() || !formEmail.trim()) {
      toast({
        title: 'Datos incompletos',
        description: 'Debes ingresar código (DNI), nombres, apellidos y email',
      });
      return;
    }

    const body = JSON.stringify({
      nombre: formNombres,
      apellido: formApellidos,
      dni: formCodigo,
      email: formEmail,
      telefono: null,
      fechaNacimiento: '2000-01-01',
      direccion: formCarrera || null,
      activo: true,
    });

    const save = async () => {
      try {
        if (editingEstudiante) {
          if (!canEdit) return;
          const response = await authorizedFetch(`/estudiantes/${editingEstudiante.id}`, {
            method: 'PUT',
            body,
          });
          if (!response.ok) {
            throw new Error('Error al actualizar estudiante');
          }
        } else {
          if (!canCreate) return;
          const response = await authorizedFetch('/estudiantes', {
            method: 'POST',
            body,
          });
          if (!response.ok) {
            throw new Error('Error al crear estudiante');
          }
        }

        await loadEstudiantes();

        toast({
          title: editingEstudiante ? 'Estudiante actualizado' : 'Estudiante creado',
          description: 'Los cambios se han guardado correctamente',
        });

        setIsDialogOpen(false);
        setEditingEstudiante(null);
        setFormCodigo('');
        setFormCarrera('');
        setFormNombres('');
        setFormApellidos('');
        setFormEmail('');
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
        title="Gestión de Estudiantes"
        description="Administra el registro de estudiantes de la universidad"
        actions={
          canCreate && (
            <Button
              onClick={() => {
                setEditingEstudiante(null);
                setFormCodigo('');
                setFormCarrera('');
                setFormNombres('');
                setFormApellidos('');
                setFormEmail('');
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nuevo Estudiante
            </Button>
          )
        }
      />

      <DataTable
        data={estudiantes}
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
              <GraduationCap className="h-5 w-5" />
              {editingEstudiante ? 'Editar Estudiante' : 'Nuevo Estudiante'}
            </DialogTitle>
            <DialogDescription>
              {editingEstudiante
                ? 'Modifica los datos del estudiante'
                : 'Ingresa los datos del nuevo estudiante'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={formCodigo}
                  onChange={(e) => setFormCodigo(e.target.value)}
                  placeholder="2024001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carrera">Carrera</Label>
                <Input
                  id="carrera"
                  value={formCarrera}
                  onChange={(e) => setFormCarrera(e.target.value)}
                  placeholder="Ingeniería de Sistemas"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombres">Nombres</Label>
                <Input
                  id="nombres"
                  value={formNombres}
                  onChange={(e) => setFormNombres(e.target.value)}
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input
                  id="apellidos"
                  value={formApellidos}
                  onChange={(e) => setFormApellidos(e.target.value)}
                  placeholder="Pérez Gómez"
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
                placeholder="estudiante@universidad.edu"
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
