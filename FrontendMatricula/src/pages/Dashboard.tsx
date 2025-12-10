import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  BookOpen,
  GraduationCap,
  ClipboardList,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Link } from 'react-router-dom';

const matriculasData = [
  { mes: 'Ene', matriculas: 120 },
  { mes: 'Feb', matriculas: 145 },
  { mes: 'Mar', matriculas: 180 },
  { mes: 'Abr', matriculas: 165 },
  { mes: 'May', matriculas: 210 },
  { mes: 'Jun', matriculas: 195 },
];

const cursosData = [
  { curso: 'Matemáticas', estudiantes: 85 },
  { curso: 'Física', estudiantes: 72 },
  { curso: 'Química', estudiantes: 68 },
  { curso: 'Programación', estudiantes: 95 },
  { curso: 'Inglés', estudiantes: 78 },
];

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card className="border-border shadow-soft hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {trend && (
            <span
              className={`flex items-center text-xs font-medium ${
                trend.isPositive ? 'text-success' : 'text-destructive'
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(trend.value)}%
            </span>
          )}
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user, hasPermission } = useAuth();

  const canAdmin =
    hasPermission('usuarios', 'READ') ||
    hasPermission('roles', 'READ') ||
    hasPermission('permisos', 'READ');

  const canAcademic =
    hasPermission('cursos', 'READ') ||
    hasPermission('profesores', 'READ') ||
    hasPermission('secciones', 'READ');

  const canStudentModule =
    hasPermission('estudiantes', 'READ') || hasPermission('matriculas', 'READ');

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`Bienvenido, ${user?.displayName?.split(' ')[0] || 'Usuario'}`}
        description="Resumen general del sistema de matrícula universitaria"
      />

      {(canAdmin || canAcademic || canStudentModule) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {canAdmin && (
            <Card className="border-border shadow-soft hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Shield className="h-4 w-4 text-primary" />
                  Administración
                </CardTitle>
                <CardDescription>Gestión de usuarios, roles y permisos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  to="/admin/usuarios"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  Usuarios
                </Link>
                <Link
                  to="/admin/roles"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  Roles
                </Link>
                <Link
                  to="/admin/permisos"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  Permisos
                </Link>
              </CardContent>
            </Card>
          )}

          {canAcademic && (
            <Card className="border-border shadow-soft hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Académico
                </CardTitle>
                <CardDescription>Gestión de cursos, profesores y secciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  to="/academico/cursos"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  Cursos
                </Link>
                <Link
                  to="/academico/profesores"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  Profesores
                </Link>
                <Link
                  to="/academico/secciones"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  Secciones
                </Link>
              </CardContent>
            </Card>
          )}

          {canStudentModule && (
            <Card className="border-border shadow-soft hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  Estudiantes
                </CardTitle>
                <CardDescription>Gestión y seguimiento de estudiantes y matrículas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  to="/estudiantes"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  Estudiantes
                </Link>
                <Link
                  to="/matriculas"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  Matrículas
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Estudiantes"
          value="1,234"
          description="estudiantes activos"
          icon={<GraduationCap className="h-5 w-5 text-primary" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Matrículas"
          value="856"
          description="este periodo"
          icon={<ClipboardList className="h-5 w-5 text-primary" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Cursos Activos"
          value="48"
          description="cursos disponibles"
          icon={<BookOpen className="h-5 w-5 text-primary" />}
          trend={{ value: 3, isPositive: false }}
        />
        <StatCard
          title="Profesores"
          value="156"
          description="docentes registrados"
          icon={<Users className="h-5 w-5 text-primary" />}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="border-border shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Matrículas por Mes</CardTitle>
                <CardDescription>Evolución de matrículas en el semestre</CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={matriculasData}>
                  <defs>
                    <linearGradient id="colorMatriculas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="matriculas"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorMatriculas)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Estudiantes por Curso</CardTitle>
                <CardDescription>Top 5 cursos con mayor demanda</CardDescription>
              </div>
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cursosData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    dataKey="curso"
                    type="category"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey="estudiantes"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Actividad Reciente</CardTitle>
              <CardDescription>Últimas operaciones en el sistema</CardDescription>
            </div>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'Nueva matrícula', detail: 'Juan Pérez - Programación I', time: 'Hace 5 min', type: 'matricula' },
              { action: 'Estudiante registrado', detail: 'María García - Ingeniería', time: 'Hace 15 min', type: 'estudiante' },
              { action: 'Curso actualizado', detail: 'Matemáticas II - Horario modificado', time: 'Hace 1 hora', type: 'curso' },
              { action: 'Nueva sección', detail: 'Física I - Prof. Roberto López', time: 'Hace 2 horas', type: 'seccion' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    item.type === 'matricula'
                      ? 'bg-success/10 text-success'
                      : item.type === 'estudiante'
                      ? 'bg-primary/10 text-primary'
                      : item.type === 'curso'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {item.type === 'matricula' && <ClipboardList className="h-5 w-5" />}
                  {item.type === 'estudiante' && <GraduationCap className="h-5 w-5" />}
                  {item.type === 'curso' && <BookOpen className="h-5 w-5" />}
                  {item.type === 'seccion' && <Users className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
