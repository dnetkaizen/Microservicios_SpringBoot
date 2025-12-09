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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ClipboardList, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Matricula {
  id: string;
  estudiante: string;
  codigoEstudiante: string;
  seccion: string;
  curso: string;
  fecha: string;
  estado: 'activa' | 'retirada' | 'completada';
}

const mockMatriculas: Matricula[] = [
  { id: '1', estudiante: 'Juan Pérez Gómez', codigoEstudiante: '2024001', seccion: 'MAT101-A', curso: 'Matemáticas I', fecha: '2024-01-15', estado: 'activa' },
  { id: '2', estudiante: 'Juan Pérez Gómez', codigoEstudiante: '2024001', seccion: 'FIS101-A', curso: 'Física I', fecha: '2024-01-15', estado: 'activa' },
  { id: '3', estudiante: 'María García López', codigoEstudiante: '2024002', seccion: 'PRG101-A', curso: 'Programación I', fecha: '2024-01-14', estado: 'activa' },
  { id: '4', estudiante: 'Carlos Rodríguez Silva', codigoEstudiante: '2024003', seccion: 'MAT101-B', curso: 'Matemáticas I', fecha: '2024-01-12', estado: 'retirada' },
  { id: '5', estudiante: 'Ana Martínez Ruiz', codigoEstudiante: '2023050', seccion: 'PRG101-B', curso: 'Programación I', fecha: '2023-08-20', estado: 'completada' },
];

export default function Matriculas() {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const [matriculas, setMatriculas] = useState<Matricula[]>(mockMatriculas);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMatricula, setEditingMatricula] = useState<Matricula | null>(null);

  const canCreate = hasPermission('matriculas', 'CREATE');
  const canEdit = hasPermission('matriculas', 'UPDATE');
  const canDelete = hasPermission('matriculas', 'DELETE');

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
    setIsDialogOpen(true);
  };

  const handleDelete = (matricula: Matricula) => {
    setMatriculas(matriculas.filter((m) => m.id !== matricula.id));
    toast({
      title: 'Matrícula eliminada',
      description: 'La matrícula ha sido eliminada correctamente',
    });
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    setEditingMatricula(null);
    toast({
      title: editingMatricula ? 'Matrícula actualizada' : 'Matrícula creada',
      description: 'Los cambios se han guardado correctamente',
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Gestión de Matrículas"
        description="Administra las matrículas de estudiantes en secciones"
        actions={
          canCreate && (
            <Button onClick={() => setIsDialogOpen(true)}>
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
              <Select defaultValue={editingMatricula?.codigoEstudiante}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estudiante" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024001">Juan Pérez Gómez (2024001)</SelectItem>
                  <SelectItem value="2024002">María García López (2024002)</SelectItem>
                  <SelectItem value="2024003">Carlos Rodríguez Silva (2024003)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seccion">Sección</Label>
              <Select defaultValue={editingMatricula?.seccion}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una sección" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAT101-A">MAT101-A - Matemáticas I</SelectItem>
                  <SelectItem value="MAT101-B">MAT101-B - Matemáticas I</SelectItem>
                  <SelectItem value="FIS101-A">FIS101-A - Física I</SelectItem>
                  <SelectItem value="PRG101-A">PRG101-A - Programación I</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editingMatricula && (
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select defaultValue={editingMatricula?.estado}>
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
            )}
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
