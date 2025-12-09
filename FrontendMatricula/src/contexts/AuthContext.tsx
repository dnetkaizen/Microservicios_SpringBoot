import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { firebaseApp } from '@/lib/firebase';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { authorizedFetch } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  mfaRequired: boolean;
  login: () => Promise<void>;
  loginWithCredentials: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => void;
  verifyMfa: (code: string) => Promise<boolean>;
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for development
const mockUser: User = {
  id: '1',
  email: 'admin@universidad.edu',
  displayName: 'Admin Usuario',
  photoURL: undefined,
  roles: ['ADMIN_MATRICULA', 'OPERADOR'],
};

// Mock permissions based on roles
const rolePermissions: Record<string, Record<string, string[]>> = {
  ADMIN_MATRICULA: {
    usuarios: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    roles: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    permisos: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    cursos: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    profesores: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    secciones: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    estudiantes: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    matriculas: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  },
  OPERADOR: {
    cursos: ['READ'],
    profesores: ['READ'],
    secciones: ['READ', 'UPDATE'],
    estudiantes: ['CREATE', 'READ', 'UPDATE'],
    matriculas: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  },
  ESTUDIANTE: {
    cursos: ['READ'],
    secciones: ['READ'],
    matriculas: ['READ'],
  },
};

interface AuthRoleResponse {
  id: number;
  nombre: string;
  descripcion: string;
  permisos: string[];
}

type RolePermissionsMap = Record<string, Record<string, string[]>>;

function parsePermissionName(nombre: string): { recursoId: string; operacion: string } | null {
  const parts = nombre.split(':');
  if (parts.length !== 2) return null;
  return { recursoId: parts[0], operacion: parts[1] };
}

function buildRolePermissionsMap(roles: AuthRoleResponse[]): RolePermissionsMap {
  const map: RolePermissionsMap = {};

  for (const role of roles) {
    const permsByResource: Record<string, string[]> = {};

    if (role.permisos) {
      for (const nombre of role.permisos) {
        const parsed = parsePermissionName(nombre);
        if (!parsed) continue;
        const { recursoId, operacion } = parsed;

        if (!permsByResource[recursoId]) {
          permsByResource[recursoId] = [];
        }
        if (!permsByResource[recursoId].includes(operacion)) {
          permsByResource[recursoId].push(operacion);
        }
      }
    }

    map[role.nombre] = permsByResource;
  }

  return map;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [backendRolePermissions, setBackendRolePermissions] = useState<RolePermissionsMap>({});

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('matricula_user');
    const storedToken = localStorage.getItem('matricula_jwt');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const loadRolePermissions = async () => {
      const token = localStorage.getItem('matricula_jwt');
      if (!user || !token) {
        setBackendRolePermissions({});
        return;
      }

      try {
        const response = await authorizedFetch('/auth/roles');
        if (!response.ok) {
          throw new Error('Error al cargar permisos de roles');
        }
        const data: AuthRoleResponse[] = await response.json();
        setBackendRolePermissions(buildRolePermissionsMap(data));
      } catch (error) {
        console.error('Error al cargar permisos de roles:', error);
      }
    };

    loadRolePermissions();
  }, [user]);

  const login = async () => {
    setIsLoading(true);
    try {
      // Simulate Firebase Google login + backend auth
      // In production, this would:
      // 1. Call Firebase signInWithPopup
      // 2. Get idToken
      // 3. Send to POST /auth/google/login
      // 4. Handle MFA if required

      const auth = getAuth(firebaseApp);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const authApiUrl = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8087/api/auth';
      const response = await fetch(`${authApiUrl}/google/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error('Error al autenticar con el backend');
      }

      const data: { token: string; type: string; username: string; email: string; roles: string[] } = await response.json();

      const mappedUser: User = {
        id: data.email || data.username,
        email: data.email,
        displayName: result.user.displayName || data.username,
        photoURL: result.user.photoURL || undefined,
        roles: data.roles || [],
      };

      setUser(mappedUser);
      localStorage.setItem('matricula_user', JSON.stringify(mappedUser));
      localStorage.setItem('matricula_jwt', data.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithCredentials = async (usernameOrEmail: string, password: string) => {
    setIsLoading(true);
    try {
      const authApiUrl = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8087/api/auth';
      const response = await fetch(`${authApiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      if (!response.ok) {
        throw new Error('Error al autenticar con el backend');
      }

      const data: { token: string; type: string; username: string; email: string; roles: string[] } = await response.json();

      const mappedUser: User = {
        id: data.email || data.username,
        email: data.email || data.username,
        displayName: data.username,
        photoURL: undefined,
        roles: data.roles || [],
      };

      setUser(mappedUser);
      localStorage.setItem('matricula_user', JSON.stringify(mappedUser));
      localStorage.setItem('matricula_jwt', data.token);
    } catch (error) {
      console.error('Login with credentials error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    const auth = getAuth(firebaseApp);
    signOut(auth).catch((error) => {
      console.error('Error al cerrar sesión de Firebase:', error);
    });
    setUser(null);
    setMfaRequired(false);
    localStorage.removeItem('matricula_user');
    localStorage.removeItem('matricula_jwt');
  };

  const verifyMfa = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate MFA verification
      if (code === '123456') {
        setUser(mockUser);
        setMfaRequired(false);
        localStorage.setItem('matricula_user', JSON.stringify(mockUser));
        localStorage.setItem('matricula_jwt', 'mock_jwt_token');
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false;

    // Primero verificamos permisos obtenidos desde el backend
    for (const role of user.roles) {
      const permissions = backendRolePermissions[role];
      if (permissions && permissions[resource]?.includes(action)) {
        return true;
      }
    }

    // Fallback: permisos estáticos de desarrollo
    for (const role of user.roles) {
      const permissions = rolePermissions[role];
      if (permissions && permissions[resource]?.includes(action)) {
        return true;
      }
    }

    return false;
  };

  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        mfaRequired,
        login,
        loginWithCredentials,
        logout,
        verifyMfa,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
