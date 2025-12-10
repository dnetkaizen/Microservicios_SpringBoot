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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ClipboardList, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authorizedFetch } from '@/lib/api';

interface Matricula {
  id: string;
  estudiante: string;
  codigoEstudiante: string;
  seccion: string;
  curso: string;
  fecha: string;
  estado: 'activa' | 'retirada' | 'completada';
}

interface MatriculaResponseDto {
  id: number;
  estudianteId: number;
  estudianteNombreCompleto: string;
  seccionId: number;
  seccionCodigo: string;
  cursoCodigo: string;
  fechaMatricula: string;
  estado: string;
  costo: number;
  metodoPago: string;
  fechaRegistro: string | null;
}

interface EstudianteOption {
  id: string;
  nombreCompleto: string;
}

interface EstudianteListDto {
  id: number;
  nombre: string;
  apellido: string;
}

interface SeccionOption {
  id: string;
  label: string;
}

interface SeccionListDto {
  id: number;
  codigo: string;
  cursoNombre: string;
}

export default function Matriculas() {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMatricula, setEditingMatricula] = useState<Matricula | null>(null);

  const [estudiantes, setEstudiantes] = useState<EstudianteOption[]>([]);
  const [secciones, setSecciones] = useState<SeccionOption[]>([]);

  const [selectedEstudianteId, setSelectedEstudianteId] = useState('');
  const [selectedSeccionId, setSelectedSeccionId] = useState('');
  const [formEstado, setFormEstado] = useState<'activa' | 'retirada' | 'completada'>('activa');

  const canRead = hasPermission('matriculas', 'READ');
  const canCreate = hasPermission('matriculas', 'CREATE');
  const canEdit = hasPermission('matriculas', 'UPDATE');
  const canDelete = hasPermission('matriculas', 'DELETE');

  const mapDtoToMatricula = (dto: MatriculaResponseDto): Matricula => ({
    id: String(dto.id),
    estudiante: dto.estudianteNombreCompleto,
    codigoEstudiante: String(dto.estudianteId),
    seccion: dto.seccionCodigo,
    curso: dto.cursoCodigo,
    fecha: dto.fechaMatricula,
    estado: dto.estado as 'activa' | 'retirada' | 'completada',
  });

  const loadMatriculas = async () => {
    if (!canRead) return;
    try {
      const response = await authorizedFetch('/matriculas');
      if (!response.ok) {
        throw new Error('Error al cargar matrículas');
      }
      const data: MatriculaResponseDto[] = await response.json();
      setMatriculas(data.map(mapDtoToMatricula));
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las matrículas',
      });
    }
  };

  const loadEstudiantes = async () => {
    try {
      const response = await authorizedFetch('/estudiantes');
      if (!response.ok) return;
      const data: EstudianteListDto[] = await response.json();
      setEstudiantes(
        data.map((e) => ({
          id: String(e.id),
          nombreCompleto: `${e.nombre} ${e.apellido}`,
        })),
      );
    } catch (error) {
      console.error('Error al cargar estudiantes para matrículas:', error);
    }
  };

  const loadSecciones = async () => {
    try {
      const response = await authorizedFetch('/secciones');
      if (!response.ok) return;
      const data: SeccionListDto[] = await response.json();
      setSecciones(
        data.map((s) => ({
          id: String(s.id),
          label: `${s.codigo} - ${s.cursoNombre}`,
        })),
      );
    } catch (error) {
      console.error('Error al cargar secciones para matrículas:', error);
    }
  };

  useEffect(() => {
    if (!canRead) return;
    void loadMatriculas();
    void loadEstudiantes();
    void loadSecciones();
  }, [canRead]);

  const columns: Column<Matricula>[] = [
    {
      key: 'codigoEstudiante',
      header: 'Estudiante',
      render: (matricula) => (
        <div>
          <p className="font-medium">{matricula.estudiante}</p>
          <p className="text-xs text-muted-foreground font-mono">{matricula.codigoEstudiante}</p>
        </div>
      ),
    },
    {
      key: 'seccion',
      header: 'Sección',
      render: (matricula) => (
        <div>
          <span className="font-mono font-medium text-primary">{matricula.seccion}</span>
          <p className="text-xs text-muted-foreground">{matricula.curso}</p>
        </div>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha',
      render: (matricula) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{matricula.fecha}</span>
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (matricula) => (
        <Badge
          variant={
            matricula.estado === 'activa'
              ? 'default'
              : matricula.estado === 'completada'
              ? 'secondary'
              : 'destructive'
          }
        >
          {matricula.estado}
        </Badge>
      ),
    },
  ];

  const handleEdit = (matricula: Matricula) => {
    setEditingMatricula(matricula);
    setSelectedEstudianteId(matricula.codigoEstudiante);
    // No tenemos seccionId en el modelo actual, así que usamos el código de sección como valor del select.
    setSelectedSeccionId(matricula.seccion);
    setFormEstado(matricula.estado);
    setIsDialogOpen(true);
  };

  const handleDelete = (matricula: Matricula) => {
    if (!canDelete) return;

    const deleteMatricula = async () => {
      try {
        const response = await authorizedFetch(`/matriculas/${matricula.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Error al eliminar matrícula');
        }
        setMatriculas((prev) => prev.filter((m) => m.id !== matricula.id));
        toast({
          title: 'Matrícula eliminada',
          description: 'La matrícula ha sido eliminada correctamente',
        });
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'No se pudo eliminar la matrícula',
        });
      }
    };

    void deleteMatricula();
  };

  const handleSave = () => {
    if (!selectedEstudianteId || !selectedSeccionId) {
      toast({
        title: 'Datos incompletos',
        description: 'Debes seleccionar un estudiante y una sección',
      });
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    const body = JSON.stringify({
      estudianteId: Number(selectedEstudianteId),
      seccionId: Number(selectedSeccionId),
      fechaMatricula: editingMatricula ? editingMatricula.fecha : today,
      estado: formEstado,
      costo: 0,
      metodoPago: 'EFECTIVO',
    });

    const save = async () => {
      try {
        if (editingMatricula) {
          if (!canEdit) return;
          const response = await authorizedFetch(`/matriculas/${editingMatricula.id}`, {
            method: 'PUT',
            body,
          });
          if (!response.ok) {
            throw new Error('Error al actualizar matrícula');
          }
        } else {
          if (!canCreate) return;
          const response = await authorizedFetch('/matriculas', {
            method: 'POST',
            body,
          });
          if (!response.ok) {
            throw new Error('Error al crear matrícula');
          }
        }

        await loadMatriculas();

        toast({
          title: editingMatricula ? 'Matrícula actualizada' : 'Matrícula creada',
          description: 'Los cambios se han guardado correctamente',
        });

        setIsDialogOpen(false);
        setEditingMatricula(null);
        setSelectedEstudianteId('');
        setSelectedSeccionId('');
        setFormEstado('activa');
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
        title="Gestión de Matrículas"
        description="Administra las matrículas de estudiantes en secciones"
        actions={
          canCreate && (
            <Button
              onClick={() => {
                setEditingMatricula(null);
                setSelectedEstudianteId('');
                setSelectedSeccionId('');
                setFormEstado('activa');
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nueva Matrícula
            </Button>
          )
        }
      />

      <DataTable
        data={matriculas}
        columns={columns}
        searchKey="estudiante"
        searchPlaceholder="Buscar por estudiante..."
        onEdit={canEdit ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
        canEdit={canEdit}
        canDelete={canDelete}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              {editingMatricula ? 'Editar Matrícula' : 'Nueva Matrícula'}
            </DialogTitle>
            <DialogDescription>
              {editingMatricula
                ? 'Modifica los datos de la matrícula'
                : 'Matricula un estudiante en una sección'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="estudiante">Estudiante</Label>
              <Select
                value={selectedEstudianteId}
                onValueChange={setSelectedEstudianteId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estudiante" />
                </SelectTrigger>
                <SelectContent>
                  {estudiantes.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nombreCompleto} ({e.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seccion">Sección</Label>
              <Select value={selectedSeccionId} onValueChange={setSelectedSeccionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una sección" />
                </SelectTrigger>
                <SelectContent>
                  {secciones.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formEstado}
                onValueChange={(value) =>
                  setFormEstado(value as 'activa' | 'retirada' | 'completada')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activa">Activa</SelectItem>
                  <SelectItem value="retirada">Retirada</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingMatricula ? 'Guardar' : 'Matricular'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
