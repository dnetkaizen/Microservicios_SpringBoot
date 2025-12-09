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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Building2, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Seccion {
  id: string;
  codigo: string;
  curso: string;
  profesor: string;
  horario: string;
  cupo: number;
  inscritos: number;
}

const mockSecciones: Seccion[] = [
  { id: '1', codigo: 'MAT101-A', curso: 'Matemáticas I', profesor: 'Roberto López', horario: 'Lun-Mie 8:00-10:00', cupo: 40, inscritos: 38 },
  { id: '2', codigo: 'MAT101-B', curso: 'Matemáticas I', profesor: 'Roberto López', horario: 'Mar-Jue 10:00-12:00', cupo: 40, inscritos: 35 },
  { id: '3', codigo: 'FIS101-A', curso: 'Física I', profesor: 'María Fernández', horario: 'Lun-Mie 10:00-12:00', cupo: 35, inscritos: 32 },
  { id: '4', codigo: 'PRG101-A', curso: 'Programación I', profesor: 'Carlos Martínez', horario: 'Mar-Jue 14:00-16:00', cupo: 30, inscritos: 30 },
  { id: '5', codigo: 'PRG101-B', curso: 'Programación I', profesor: 'Carlos Martínez', horario: 'Vie 8:00-12:00', cupo: 30, inscritos: 25 },
];

export default function Secciones() {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const [secciones, setSecciones] = useState<Seccion[]>(mockSecciones);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSeccion, setEditingSeccion] = useState<Seccion | null>(null);

  const canCreate = hasPermission('secciones', 'CREATE');
  const canEdit = hasPermission('secciones', 'UPDATE');
  const canDelete = hasPermission('secciones', 'DELETE');

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
              variant={porcentaje >= 100 ? 'destructive' : porcentaje >= 80 ? 'default' : 'secondary'}
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
    setIsDialogOpen(true);
  };

  const handleDelete = (seccion: Seccion) => {
    setSecciones(secciones.filter((s) => s.id !== seccion.id));
    toast({
      title: 'Sección eliminada',
      description: `${seccion.codigo} ha sido eliminada correctamente`,
    });
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    setEditingSeccion(null);
    toast({
      title: editingSeccion ? 'Sección actualizada' : 'Sección creada',
      description: 'Los cambios se han guardado correctamente',
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Gestión de Secciones"
        description="Administra las secciones de cursos y sus horarios"
        actions={
          canCreate && (
            <Button onClick={() => setIsDialogOpen(true)}>
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
                  defaultValue={editingSeccion?.codigo}
                  placeholder="MAT101-A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cupo">Cupo máximo</Label>
                <Input
                  id="cupo"
                  type="number"
                  defaultValue={editingSeccion?.cupo}
                  placeholder="40"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="curso">Curso</Label>
              <Select defaultValue={editingSeccion?.curso}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Matemáticas I">Matemáticas I</SelectItem>
                  <SelectItem value="Física I">Física I</SelectItem>
                  <SelectItem value="Programación I">Programación I</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profesor">Profesor</Label>
              <Select defaultValue={editingSeccion?.profesor}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un profesor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Roberto López">Roberto López</SelectItem>
                  <SelectItem value="María Fernández">María Fernández</SelectItem>
                  <SelectItem value="Carlos Martínez">Carlos Martínez</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="horario">Horario</Label>
              <Input
                id="horario"
                defaultValue={editingSeccion?.horario}
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
