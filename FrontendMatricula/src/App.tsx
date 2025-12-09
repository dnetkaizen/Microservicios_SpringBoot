import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Usuarios from "./pages/admin/Usuarios";
import Roles from "./pages/admin/Roles";
import Permisos from "./pages/admin/Permisos";
import Cursos from "./pages/academico/Cursos";
import Profesores from "./pages/academico/Profesores";
import Secciones from "./pages/academico/Secciones";
import Estudiantes from "./pages/estudiantes/Estudiantes";
import Matriculas from "./pages/estudiantes/Matriculas";
import Perfil from "./pages/Perfil";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Admin Routes */}
              <Route path="/admin/usuarios" element={<Usuarios />} />
              <Route path="/admin/roles" element={<Roles />} />
              <Route path="/admin/permisos" element={<Permisos />} />
              
              {/* Academic Routes */}
              <Route path="/academico/cursos" element={<Cursos />} />
              <Route path="/academico/profesores" element={<Profesores />} />
              <Route path="/academico/secciones" element={<Secciones />} />
              
              {/* Student Routes */}
              <Route path="/estudiantes" element={<Estudiantes />} />
              <Route path="/matriculas" element={<Matriculas />} />
              
              {/* Profile */}
              <Route path="/perfil" element={<Perfil />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
