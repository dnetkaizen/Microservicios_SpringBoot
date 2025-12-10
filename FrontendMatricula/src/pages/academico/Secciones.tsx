import { useEffect, useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Building2, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authorizedFetch } from '@/lib/api';

interface Seccion {
  id: string;
  codigo: string;
  curso: string;
  cursoId: number;
  profesor: string;
  profesorId: number;
  horario: string;
  cupo: number;
  inscritos: number;
}

interface SeccionResponseDto {
  id: number;
  cursoId: number;
  cursoCodigo: string;
  cursoNombre: string;
  profesorId: number;
  profesorNombreCompleto: string;
  codigo: string;
  capacidadMaxima: number;
  aula: string | null;
  horario: string | null;
  dias: string | null;
  periodoAcademico: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  fechaRegistro: string | null;
  activo: boolean;
}

interface CursoOption {
  id: string;
  nombre: string;
  codigo: string;
}

interface CursoResponseDto {
  id: number;
  codigo: string;
  nombre: string;
}

interface ProfesorOption {
  id: string;
  nombreCompleto: string;
}

interface ProfesorResponseDto {
  id: number;
  nombre: string;
  apellido: string;
}

export default function Secciones() {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSeccion, setEditingSeccion] = useState<Seccion | null>(null);

  const [cursos, setCursos] = useState<CursoOption[]>([]);
  const [profesores, setProfesores] = useState<ProfesorOption[]>([]);

  const [selectedCursoId, setSelectedCursoId] = useState('');
  const [selectedProfesorId, setSelectedProfesorId] = useState('');
  const [formCodigo, setFormCodigo] = useState('');
  const [formCupo, setFormCupo] = useState('');
  const [formHorario, setFormHorario] = useState('');

  const canRead = hasPermission('secciones', 'READ');
  const canCreate = hasPermission('secciones', 'CREATE');
  const canEdit = hasPermission('secciones', 'UPDATE');
  const canDelete = hasPermission('secciones', 'DELETE');

  const mapDtoToSeccion = (dto: SeccionResponseDto): Seccion => ({
    id: String(dto.id),
    codigo: dto.codigo,
    curso: dto.cursoNombre,
    cursoId: dto.cursoId,
    profesor: dto.profesorNombreCompleto,
    profesorId: dto.profesorId,
    horario: dto.horario ?? '',
    cupo: dto.capacidadMaxima,
    // El backend aún no expone la cantidad de inscritos por sección;
    // por ahora lo inicializamos en 0 para que la UI compile y podamos
    // completar esta parte cuando exista ese dato real.
    inscritos: 0,
  });

  const loadSecciones = async () => {
    if (!canRead) return;
    try {
      const response = await authorizedFetch('/secciones');
      if (!response.ok) {
        throw new Error('Error al cargar secciones');
      }
      const data: SeccionResponseDto[] = await response.json();
      setSecciones(data.map(mapDtoToSeccion));
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las secciones',
      });
    }
  };

  const loadCursos = async () => {
    try {
      const response = await authorizedFetch('/cursos');
      if (!response.ok) return;
      const data: CursoResponseDto[] = await response.json();
      setCursos(
        data.map((c) => ({
          id: String(c.id),
          nombre: c.nombre,
          codigo: c.codigo,
        })),
      );
    } catch (error) {
      console.error('Error al cargar cursos para secciones:', error);
    }
  };

  const loadProfesores = async () => {
    try {
      const response = await authorizedFetch('/profesores');
      if (!response.ok) return;
      const data: ProfesorResponseDto[] = await response.json();
      setProfesores(
        data.map((p) => ({
          id: String(p.id),
          nombreCompleto: `${p.nombre} ${p.apellido}`,
        })),
      );
    } catch (error) {
      console.error('Error al cargar profesores para secciones:', error);
    }
  };

  useEffect(() => {
    if (!canRead) return;
    void loadSecciones();
    void loadCursos();
    void loadProfesores();
  }, [canRead]);

  const columns: Column<Seccion>[] = [
    {
      key: 'codigo',
      header: 'Código',
      render: (seccion) => (
        <span className="font-mono font-medium text-primary">{seccion.codigo}</span>
      ),
    },
    {
      key: 'curso',
      header: 'Curso',
      render: (seccion) => (
        <span className="font-medium">{seccion.curso}</span>
      ),
    },
    { key: 'profesor', header: 'Profesor' },
    {
      key: 'horario',
      header: 'Horario',
      render: (seccion) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{seccion.horario}</span>
        </div>
      ),
    },
    {
      key: 'cupo',
      header: 'Ocupación',
      render: (seccion) => {
        const porcentaje = (seccion.inscritos / seccion.cupo) * 100;
        return (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Badge
              variant={
                porcentaje >= 100 ? 'destructive' : porcentaje >= 80 ? 'default' : 'secondary'
              }
            >
              {seccion.inscritos}/{seccion.cupo}
            </Badge>
          </div>
        );
      },
    },
  ];

  const handleEdit = (seccion: Seccion) => {
    setEditingSeccion(seccion);
    setFormCodigo(seccion.codigo);
    setFormCupo(String(seccion.cupo));
    setFormHorario(seccion.horario);
    setSelectedCursoId(String(seccion.cursoId));
    setSelectedProfesorId(String(seccion.profesorId));
    setIsDialogOpen(true);
  };

  const handleDelete = (seccion: Seccion) => {
    if (!canDelete) return;

    const deleteSeccion = async () => {
      try {
        const response = await authorizedFetch(`/secciones/${seccion.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Error al eliminar sección');
        }
        setSecciones((prev) => prev.filter((s) => s.id !== seccion.id));
        toast({
          title: 'Sección eliminada',
          description: `${seccion.codigo} ha sido eliminada correctamente`,
        });
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'No se pudo eliminar la sección',
        });
      }
    };

    void deleteSeccion();
  };

  const handleSave = () => {
    if (!formCodigo.trim() || !formCupo.trim() || !selectedCursoId || !selectedProfesorId) {
      toast({
        title: 'Datos incompletos',
        description: 'Debes ingresar código, cupo y seleccionar curso y profesor',
      });
      return;
    }

    const cupoNumber = Number(formCupo);
    if (Number.isNaN(cupoNumber) || cupoNumber <= 0) {
      toast({
        title: 'Cupo inválido',
        description: 'El cupo máximo debe ser mayor que cero',
      });
      return;
    }

    const body = JSON.stringify({
      cursoId: Number(selectedCursoId),
      profesorId: Number(selectedProfesorId),
      codigo: formCodigo,
      capacidadMaxima: cupoNumber,
      aula: null,
      horario: formHorario || null,
      dias: null,
      periodoAcademico: '2024-1',
      fechaInicio: null,
      fechaFin: null,
      activo: true,
    });

    const save = async () => {
      try {
        if (editingSeccion) {
          if (!canEdit) return;
          const response = await authorizedFetch(`/secciones/${editingSeccion.id}`, {
            method: 'PUT',
            body,
          });
          if (!response.ok) {
            throw new Error('Error al actualizar sección');
          }
        } else {
          if (!canCreate) return;
          const response = await authorizedFetch('/secciones', {
            method: 'POST',
            body,
          });
          if (!response.ok) {
            throw new Error('Error al crear sección');
          }
        }

        await loadSecciones();

        toast({
          title: editingSeccion ? 'Sección actualizada' : 'Sección creada',
          description: 'Los cambios se han guardado correctamente',
        });

        setIsDialogOpen(false);
        setEditingSeccion(null);
        setFormCodigo('');
        setFormCupo('');
        setFormHorario('');
        setSelectedCursoId('');
        setSelectedProfesorId('');
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
        title="Gestión de Secciones"
        description="Administra las secciones de cursos y sus horarios"
        actions={
          canCreate && (
            <Button
              onClick={() => {
                setEditingSeccion(null);
                setFormCodigo('');
                setFormCupo('');
                setFormHorario('');
                setSelectedCursoId('');
                setSelectedProfesorId('');
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nueva Sección
            </Button>
          )
        }
      />

      <DataTable
        data={secciones}
        columns={columns}
        searchKey="codigo"
        searchPlaceholder="Buscar sección..."
        onEdit={canEdit ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
        canEdit={canEdit}
        canDelete={canDelete}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {editingSeccion ? 'Editar Sección' : 'Nueva Sección'}
            </DialogTitle>
            <DialogDescription>
              {editingSeccion
                ? 'Modifica los datos de la sección'
                : 'Ingresa los datos de la nueva sección'}
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
                  placeholder="MAT101-A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cupo">Cupo máximo</Label>
                <Input
                  id="cupo"
                  type="number"
                  value={formCupo}
                  onChange={(e) => setFormCupo(e.target.value)}
                  placeholder="40"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="curso">Curso</Label>
              <Select value={selectedCursoId} onValueChange={setSelectedCursoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un curso" />
                </SelectTrigger>
                <SelectContent>
                  {cursos.map((curso) => (
                    <SelectItem key={curso.id} value={curso.id}>
                      {curso.nombre} ({curso.codigo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profesor">Profesor</Label>
              <Select value={selectedProfesorId} onValueChange={setSelectedProfesorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un profesor" />
                </SelectTrigger>
                <SelectContent>
                  {profesores.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.nombreCompleto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="horario">Horario</Label>
              <Input
                id="horario"
                value={formHorario}
                onChange={(e) => setFormHorario(e.target.value)}
                placeholder="Lun-Mie 8:00-10:00"
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
