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
import { Textarea } from '@/components/ui/textarea';
import { Plus, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authorizedFetch } from '@/lib/api';

interface Curso {
  id: string;
  codigo: string;
  nombre: string;
  creditos: number;
  descripcion: string;
  estado: 'activo' | 'inactivo';
}

interface CursoResponseDto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  creditos: number;
  nivelSemestre: number;
  fechaRegistro: string | null;
  activo: boolean;
}

export default function Cursos() {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);

  const [formCodigo, setFormCodigo] = useState('');
  const [formNombre, setFormNombre] = useState('');
  const [formCreditos, setFormCreditos] = useState<string>('');
  const [formDescripcion, setFormDescripcion] = useState('');

  const canRead = hasPermission('cursos', 'READ');
  const canCreate = hasPermission('cursos', 'CREATE');
  const canEdit = hasPermission('cursos', 'UPDATE');
  const canDelete = hasPermission('cursos', 'DELETE');

  const mapDtoToCurso = (dto: CursoResponseDto): Curso => ({
    id: String(dto.id),
    codigo: dto.codigo,
    nombre: dto.nombre,
    creditos: dto.creditos,
    descripcion: dto.descripcion ?? '',
    estado: dto.activo ? 'activo' : 'inactivo',
  });

  const loadCursos = async () => {
    if (!canRead) return;
    try {
      const response = await authorizedFetch('/cursos');
      if (!response.ok) {
        throw new Error('Error al cargar cursos');
      }
      const data: CursoResponseDto[] = await response.json();
      setCursos(data.map(mapDtoToCurso));
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los cursos',
      });
    }
  };

  useEffect(() => {
    loadCursos();
  }, [canRead]);

  const columns: Column<Curso>[] = [
    {
      key: 'codigo',
      header: 'Código',
      render: (curso) => (
        <span className="font-mono font-medium text-primary">{curso.codigo}</span>
      ),
    },
    { key: 'nombre', header: 'Nombre' },
    {
      key: 'creditos',
      header: 'Créditos',
      render: (curso) => (
        <Badge variant="secondary">{curso.creditos} créditos</Badge>
      ),
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      render: (curso) => (
        <span className="text-muted-foreground text-sm truncate max-w-[200px] block">
          {curso.descripcion}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (curso) => (
        <Badge variant={curso.estado === 'activo' ? 'default' : 'secondary'}>
          {curso.estado}
        </Badge>
      ),
    },
  ];

  const handleEdit = (curso: Curso) => {
    setEditingCurso(curso);
    setFormCodigo(curso.codigo);
    setFormNombre(curso.nombre);
    setFormCreditos(String(curso.creditos));
    setFormDescripcion(curso.descripcion);
    setIsDialogOpen(true);
  };

  const handleDelete = (curso: Curso) => {
    if (!canDelete) return;
    const deleteCurso = async () => {
      try {
        const response = await authorizedFetch(`/cursos/${curso.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Error al eliminar curso');
        }
        setCursos((prev) => prev.filter((c) => c.id !== curso.id));
        toast({
          title: 'Curso eliminado',
          description: `${curso.nombre} ha sido eliminado correctamente`,
        });
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el curso',
        });
      }
    };

    void deleteCurso();
  };

  const handleSave = () => {
    if (!formCodigo.trim() || !formNombre.trim() || !formCreditos.trim()) {
      toast({
        title: 'Datos incompletos',
        description: 'Debes ingresar código, nombre y créditos',
      });
      return;
    }

    const creditosNumber = Number(formCreditos);
    if (Number.isNaN(creditosNumber) || creditosNumber <= 0) {
      toast({
        title: 'Créditos inválidos',
        description: 'El número de créditos debe ser mayor que cero',
      });
      return;
    }

    const body = JSON.stringify({
      codigo: formCodigo,
      nombre: formNombre,
      descripcion: formDescripcion,
      creditos: creditosNumber,
      nivelSemestre: 1,
      activo: true,
    });

    const save = async () => {
      try {
        if (editingCurso) {
          if (!canEdit) return;
          const response = await authorizedFetch(`/cursos/${editingCurso.id}`, {
            method: 'PUT',
            body,
          });
          if (!response.ok) {
            throw new Error('Error al actualizar curso');
          }
        } else {
          if (!canCreate) return;
          const response = await authorizedFetch('/cursos', {
            method: 'POST',
            body,
          });
          if (!response.ok) {
            throw new Error('Error al crear curso');
          }
        }

        await loadCursos();

        toast({
          title: editingCurso ? 'Curso actualizado' : 'Curso creado',
          description: 'Los cambios se han guardado correctamente',
        });

        setIsDialogOpen(false);
        setEditingCurso(null);
        setFormCodigo('');
        setFormNombre('');
        setFormCreditos('');
        setFormDescripcion('');
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
        title="Gestión de Cursos"
        description="Administra el catálogo de cursos disponibles"
        actions={
          canCreate && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Nuevo Curso
            </Button>
          )
        }
      />

      <DataTable
        data={cursos}
        columns={columns}
        searchKey="nombre"
        searchPlaceholder="Buscar curso..."
        onEdit={canEdit ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
        canEdit={canEdit}
        canDelete={canDelete}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {editingCurso ? 'Editar Curso' : 'Nuevo Curso'}
            </DialogTitle>
            <DialogDescription>
              {editingCurso
                ? 'Modifica los datos del curso'
                : 'Ingresa los datos del nuevo curso'}
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
                  placeholder="MAT101"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditos">Créditos</Label>
                <Input
                  id="creditos"
                  type="number"
                  value={formCreditos}
                  onChange={(e) => setFormCreditos(e.target.value)}
                  placeholder="4"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del curso</Label>
              <Input
                id="nombre"
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
                placeholder="Matemáticas I"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formDescripcion}
                onChange={(e) => setFormDescripcion(e.target.value)}
                placeholder="Descripción del curso..."
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
