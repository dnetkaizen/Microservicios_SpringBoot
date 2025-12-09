import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Shield,
  BookOpen,
  GraduationCap,
  UserCircle,
  ClipboardList,
  Settings,
  LogOut,
  ChevronDown,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}

function NavItem({ to, icon, label, end }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-sidebar-accent text-sidebar-foreground'
            : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

interface NavGroupProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function NavGroup({ label, icon, children, defaultOpen = false }: NavGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const location = useLocation();

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200">
        {icon}
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-4 mt-1 space-y-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AppSidebar() {
  const { user, logout, hasPermission } = useAuth();
  const canManageSecurity =
    hasPermission('usuarios', 'READ') ||
    hasPermission('roles', 'READ') ||
    hasPermission('permisos', 'READ');

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-sidebar-border">
        <div className="h-9 w-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sidebar-foreground font-semibold text-sm">Matrícula</h1>
          <p className="text-sidebar-muted text-xs">Universidad</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NavItem
          to="/dashboard"
          icon={<LayoutDashboard className="h-5 w-5" />}
          label="Dashboard"
          end
        />

        {canManageSecurity && (
          <NavGroup
            label="Administración"
            icon={<Shield className="h-5 w-5" />}
            defaultOpen
          >
            <NavItem
              to="/admin/usuarios"
              icon={<Users className="h-4 w-4" />}
              label="Usuarios"
            />
            <NavItem
              to="/admin/roles"
              icon={<Shield className="h-4 w-4" />}
              label="Roles"
            />
            <NavItem
              to="/admin/permisos"
              icon={<ClipboardList className="h-4 w-4" />}
              label="Permisos"
            />
          </NavGroup>
        )}

        <NavGroup
          label="Académico"
          icon={<BookOpen className="h-5 w-5" />}
          defaultOpen
        >
          <NavItem
            to="/academico/cursos"
            icon={<BookOpen className="h-4 w-4" />}
            label="Cursos"
          />
          <NavItem
            to="/academico/profesores"
            icon={<UserCircle className="h-4 w-4" />}
            label="Profesores"
          />
          <NavItem
            to="/academico/secciones"
            icon={<Building2 className="h-4 w-4" />}
            label="Secciones"
          />
        </NavGroup>

        <NavGroup
          label="Estudiantes"
          icon={<GraduationCap className="h-5 w-5" />}
          defaultOpen
        >
          <NavItem
            to="/estudiantes"
            icon={<Users className="h-4 w-4" />}
            label="Estudiantes"
          />
          <NavItem
            to="/matriculas"
            icon={<ClipboardList className="h-4 w-4" />}
            label="Matrículas"
          />
        </NavGroup>
      </nav>

      {/* User Menu */}
      <div className="p-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-sidebar-accent/50 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                {user?.displayName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.displayName}
              </p>
              <p className="text-xs text-sidebar-muted truncate">{user?.email}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <NavLink to="/perfil" className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                Mi Perfil
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NavLink to="/configuracion" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuración
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
