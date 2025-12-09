import { useState } from 'react';
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

interface Estudiante {
  id: string;
  codigo: string;
  nombres: string;
  apellidos: string;
  email: string;
  carrera: string;
  estado: 'activo' | 'inactivo' | 'egresado';
}

const mockEstudiantes: Estudiante[] = [
  { id: '1', codigo: '2024001', nombres: 'Juan', apellidos: 'Pérez Gómez', email: 'juan.perez@estudiante.edu', carrera: 'Ingeniería de Sistemas', estado: 'activo' },
  { id: '2', codigo: '2024002', nombres: 'María', apellidos: 'García López', email: 'maria.garcia@estudiante.edu', carrera: 'Ingeniería Civil', estado: 'activo' },
  { id: '3', codigo: '2024003', nombres: 'Carlos', apellidos: 'Rodríguez Silva', email: 'carlos.rodriguez@estudiante.edu', carrera: 'Medicina', estado: 'activo' },
  { id: '4', codigo: '2023050', nombres: 'Ana', apellidos: 'Martínez Ruiz', email: 'ana.martinez@estudiante.edu', carrera: 'Derecho', estado: 'inactivo' },
  { id: '5', codigo: '2022100', nombres: 'Pedro', apellidos: 'Sánchez Vega', email: 'pedro.sanchez@estudiante.edu', carrera: 'Administración', estado: 'egresado' },
];

export default function Estudiantes() {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>(mockEstudiantes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEstudiante, setEditingEstudiante] = useState<Estudiante | null>(null);

  const canCreate = hasPermission('estudiantes', 'CREATE');
  const canEdit = hasPermission('estudiantes', 'UPDATE');
  const canDelete = hasPermission('estudiantes', 'DELETE');

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
    setIsDialogOpen(true);
  };

  const handleDelete = (estudiante: Estudiante) => {
    setEstudiantes(estudiantes.filter((e) => e.id !== estudiante.id));
    toast({
      title: 'Estudiante eliminado',
      description: `${estudiante.nombres} ${estudiante.apellidos} ha sido eliminado correctamente`,
    });
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    setEditingEstudiante(null);
    toast({
      title: editingEstudiante ? 'Estudiante actualizado' : 'Estudiante creado',
      description: 'Los cambios se han guardado correctamente',
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Gestión de Estudiantes"
        description="Administra el registro de estudiantes de la universidad"
        actions={
          canCreate && (
            <Button onClick={() => setIsDialogOpen(true)}>
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
                  defaultValue={editingEstudiante?.codigo}
                  placeholder="2024001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carrera">Carrera</Label>
                <Input
                  id="carrera"
                  defaultValue={editingEstudiante?.carrera}
                  placeholder="Ingeniería de Sistemas"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombres">Nombres</Label>
                <Input
                  id="nombres"
                  defaultValue={editingEstudiante?.nombres}
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input
                  id="apellidos"
                  defaultValue={editingEstudiante?.apellidos}
                  placeholder="Pérez Gómez"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={editingEstudiante?.email}
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
