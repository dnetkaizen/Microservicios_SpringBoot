import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Shield, Key, QrCode, Smartphone, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Perfil() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const handleMfaToggle = (enabled: boolean) => {
    if (enabled) {
      setShowMfaSetup(true);
    } else {
      setMfaEnabled(false);
      toast({
        title: 'MFA deshabilitado',
        description: 'La autenticación de dos factores ha sido deshabilitada',
      });
    }
  };

  const handleMfaConfirm = () => {
    if (otpCode === '123456') {
      setMfaEnabled(true);
      setShowMfaSetup(false);
      setOtpCode('');
      toast({
        title: 'MFA habilitado',
        description: 'La autenticación de dos factores está ahora activa',
      });
    } else {
      toast({
        title: 'Código inválido',
        description: 'El código ingresado no es correcto',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Mi Perfil"
        description="Administra tu información personal y configuración de seguridad"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Info */}
        <Card className="border-border shadow-soft">
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Tu información de cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.photoURL} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {user?.displayName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{user?.displayName}</h3>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Nombre completo</Label>
                <Input id="displayName" defaultValue={user?.displayName} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user?.email} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles */}
        <Card className="border-border shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Roles Asignados
            </CardTitle>
            <CardDescription>Tus roles y permisos en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user?.roles.map((role) => (
                <Badge key={role} variant="secondary" className="text-sm py-1 px-3">
                  {role}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Los roles determinan qué acciones puedes realizar en el sistema. Contacta al administrador si necesitas cambios en tus permisos.
            </p>
          </CardContent>
        </Card>

        {/* MFA Settings */}
        <Card className="border-border shadow-soft md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Autenticación de Dos Factores (MFA)
            </CardTitle>
            <CardDescription>
              Añade una capa extra de seguridad a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${mfaEnabled ? 'bg-success/10' : 'bg-muted'}`}>
                  <Smartphone className={`h-6 w-6 ${mfaEnabled ? 'text-success' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <h4 className="font-medium">Aplicación Autenticadora</h4>
                  <p className="text-sm text-muted-foreground">
                    Usa una app como Google Authenticator o Authy
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={mfaEnabled ? 'default' : 'secondary'}>
                  {mfaEnabled ? (
                    <span className="flex items-center gap-1">
                      <Check className="h-3 w-3" /> Habilitado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <X className="h-3 w-3" /> Deshabilitado
                    </span>
                  )}
                </Badge>
                <Switch checked={mfaEnabled} onCheckedChange={handleMfaToggle} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MFA Setup Dialog */}
      <Dialog open={showMfaSetup} onOpenChange={setShowMfaSetup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Configurar MFA
            </DialogTitle>
            <DialogDescription>
              Escanea el código QR con tu aplicación autenticadora
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Mock QR Code */}
            <div className="flex justify-center">
              <div className="h-48 w-48 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                <div className="text-center">
                  <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Código QR de ejemplo</p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                O ingresa este código manualmente:
              </p>
              <code className="bg-muted px-3 py-1 rounded text-sm font-mono">
                JBSWY3DPEHPK3PXP
              </code>
            </div>
            <div className="space-y-2">
              <Label htmlFor="otpSetup">Código de verificación</Label>
              <Input
                id="otpSetup"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-xl tracking-[0.3em] font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Ingresa el código de 6 dígitos de tu aplicación
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMfaSetup(false)}>
              Cancelar
            </Button>
            <Button onClick={handleMfaConfirm} disabled={otpCode.length !== 6}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
