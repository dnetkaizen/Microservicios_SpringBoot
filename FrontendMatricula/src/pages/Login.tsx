import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Loader2, Shield, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const { login, loginWithCredentials, verifyMfa, isAuthenticated, isLoading, mfaRequired } = useAuth();
  const { toast } = useToast();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleLogin = async () => {
    try {
      await login();
    } catch (error) {
      toast({
        title: 'Error de autenticación',
        description: 'No se pudo iniciar sesión con Google. Por favor intente de nuevo.',
        variant: 'destructive',
      });
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usernameOrEmail.trim() || !password.trim()) {
      toast({
        title: 'Datos incompletos',
        description: 'Ingresa usuario o email y contraseña',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsPasswordSubmitting(true);
      await loginWithCredentials(usernameOrEmail, password);
    } catch (error) {
      toast({
        title: 'Error de autenticación',
        description: 'Usuario o contraseña incorrectos',
        variant: 'destructive',
      });
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    if (otpCode.length !== 6) {
      setOtpError('El código debe tener 6 dígitos');
      return;
    }

    const success = await verifyMfa(otpCode);
    if (!success) {
      setOtpError('Código inválido o expirado');
      setOtpCode('');
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-sidebar-foreground">
                Sistema de Matrícula
              </h1>
              <p className="text-sidebar-muted">Universidad</p>
            </div>
          </div>
          <div className="space-y-6 max-w-md">
            <h2 className="text-4xl font-bold text-sidebar-foreground leading-tight">
              Gestión académica simplificada
            </h2>
            <p className="text-sidebar-muted text-lg">
              Administra cursos, profesores, estudiantes y matrículas desde una plataforma unificada y segura.
            </p>
            <div className="flex items-center gap-3 text-sidebar-muted">
              <Shield className="h-5 w-5 text-primary" />
              <span>Autenticación segura con Google y MFA</span>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-2xl" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Matrícula</h1>
              <p className="text-muted-foreground text-sm">Universidad</p>
            </div>
          </div>

          {!mfaRequired ? (
            <Card className="border-border shadow-soft">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl">Bienvenido</CardTitle>
                <CardDescription>
                  Inicia sesión para acceder al sistema de matrícula
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="google"
                  size="xl"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  )}
                  Iniciar sesión con Google
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-6">
                  Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad.
                </p>

                <div className="mt-6 border-t border-border pt-6 space-y-4">
                  <form onSubmit={handleCredentialsLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="usernameOrEmail">Usuario o email</Label>
                      <Input
                        id="usernameOrEmail"
                        value={usernameOrEmail}
                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                        placeholder="admin@universidad.edu"
                        autoComplete="username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || isPasswordSubmitting}
                    >
                      {isPasswordSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        'Iniciar sesión con usuario y contraseña'
                      )}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border shadow-soft">
              <CardHeader className="space-y-1 pb-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Verificación MFA</CardTitle>
                <CardDescription>
                  Ingresa el código de 6 dígitos de tu aplicación autenticadora
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMfaVerify} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Código OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="000000"
                      value={otpCode}
                      onChange={(e) => {
                        setOtpCode(e.target.value.replace(/\D/g, ''));
                        setOtpError('');
                      }}
                      className="text-center text-2xl tracking-[0.5em] font-mono"
                      autoFocus
                    />
                    {otpError && (
                      <div className="flex items-center gap-2 text-destructive text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {otpError}
                      </div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isLoading || otpCode.length !== 6}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      'Verificar'
                    )}
                  </Button>
                </form>

                <p className="text-xs text-muted-foreground text-center mt-6">
                  ¿No tienes acceso a tu aplicación? Contacta al administrador del sistema.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
