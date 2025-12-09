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
import { Plus, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Profesor {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  especialidad: string;
  estado: 'activo' | 'inactivo';
}

const mockProfesores: Profesor[] = [
  { id: '1', nombres: 'Roberto', apellidos: 'López García', email: 'r.lopez@universidad.edu', especialidad: 'Matemáticas', estado: 'activo' },
  { id: '2', nombres: 'María', apellidos: 'Fernández Ruiz', email: 'm.fernandez@universidad.edu', especialidad: 'Física', estado: 'activo' },
  { id: '3', nombres: 'Carlos', apellidos: 'Martínez Soto', email: 'c.martinez@universidad.edu', especialidad: 'Programación', estado: 'activo' },
  { id: '4', nombres: 'Ana', apellidos: 'Rodríguez Vega', email: 'a.rodriguez@universidad.edu', especialidad: 'Química', estado: 'inactivo' },
  { id: '5', nombres: 'Pedro', apellidos: 'Sánchez Luna', email: 'p.sanchez@universidad.edu', especialidad: 'Inglés', estado: 'activo' },
];

export default function Profesores() {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const [profesores, setProfesores] = useState<Profesor[]>(mockProfesores);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfesor, setEditingProfesor] = useState<Profesor | null>(null);

  const canCreate = hasPermission('profesores', 'CREATE');
  const canEdit = hasPermission('profesores', 'UPDATE');
  const canDelete = hasPermission('profesores', 'DELETE');

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
    setIsDialogOpen(true);
  };

  const handleDelete = (profesor: Profesor) => {
    setProfesores(profesores.filter((p) => p.id !== profesor.id));
    toast({
      title: 'Profesor eliminado',
      description: `${profesor.nombres} ${profesor.apellidos} ha sido eliminado correctamente`,
    });
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    setEditingProfesor(null);
    toast({
      title: editingProfesor ? 'Profesor actualizado' : 'Profesor creado',
      description: 'Los cambios se han guardado correctamente',
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Gestión de Profesores"
        description="Administra el directorio de profesores de la universidad"
        actions={
          canCreate && (
            <Button onClick={() => setIsDialogOpen(true)}>
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
                  defaultValue={editingProfesor?.nombres}
                  placeholder="Roberto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input
                  id="apellidos"
                  defaultValue={editingProfesor?.apellidos}
                  placeholder="López García"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={editingProfesor?.email}
                placeholder="profesor@universidad.edu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="especialidad">Especialidad</Label>
              <Input
                id="especialidad"
                defaultValue={editingProfesor?.especialidad}
                placeholder="Matemáticas"
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
