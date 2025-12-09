import { useState } from 'react';
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

interface Curso {
  id: string;
  codigo: string;
  nombre: string;
  creditos: number;
  descripcion: string;
  estado: 'activo' | 'inactivo';
}

const mockCursos: Curso[] = [
  { id: '1', codigo: 'MAT101', nombre: 'Matemáticas I', creditos: 4, descripcion: 'Cálculo diferencial e integral', estado: 'activo' },
  { id: '2', codigo: 'FIS101', nombre: 'Física I', creditos: 4, descripcion: 'Mecánica clásica', estado: 'activo' },
  { id: '3', codigo: 'PRG101', nombre: 'Programación I', creditos: 3, descripcion: 'Fundamentos de programación', estado: 'activo' },
  { id: '4', codigo: 'QUI101', nombre: 'Química General', creditos: 4, descripcion: 'Química inorgánica y orgánica básica', estado: 'activo' },
  { id: '5', codigo: 'ING101', nombre: 'Inglés I', creditos: 2, descripcion: 'Inglés básico', estado: 'inactivo' },
];

export default function Cursos() {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const [cursos, setCursos] = useState<Curso[]>(mockCursos);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);

  const canCreate = hasPermission('cursos', 'CREATE');
  const canEdit = hasPermission('cursos', 'UPDATE');
  const canDelete = hasPermission('cursos', 'DELETE');

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
    setIsDialogOpen(true);
  };

  const handleDelete = (curso: Curso) => {
    setCursos(cursos.filter((c) => c.id !== curso.id));
    toast({
      title: 'Curso eliminado',
      description: `${curso.nombre} ha sido eliminado correctamente`,
    });
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    setEditingCurso(null);
    toast({
      title: editingCurso ? 'Curso actualizado' : 'Curso creado',
      description: 'Los cambios se han guardado correctamente',
    });
  };

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
                  defaultValue={editingCurso?.codigo}
                  placeholder="MAT101"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditos">Créditos</Label>
                <Input
                  id="creditos"
                  type="number"
                  defaultValue={editingCurso?.creditos}
                  placeholder="4"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del curso</Label>
              <Input
                id="nombre"
                defaultValue={editingCurso?.nombre}
                placeholder="Matemáticas I"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                defaultValue={editingCurso?.descripcion}
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
