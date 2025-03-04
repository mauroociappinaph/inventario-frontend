import { useToast } from '@/hooks/useToast';
import authService from '@/lib/api/auth-service';
import { connectionState } from '@/lib/api/sync-utils';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [hasBackendConnection, setHasBackendConnection] = useState(connectionState.hasBackendConnection);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<'valid' | 'expiring-soon' | 'expired'>('valid');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar estado inicial
    setIsOnline(navigator.onLine);
    checkTokenStatus();

    // Configurar listeners para conexión de red
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Listener para cambios en el estado de la conexión del backend
    const checkBackendConnection = () => {
      setHasBackendConnection(connectionState.hasBackendConnection);
    };

    // Verificar autenticación periódicamente
    const checkAuthentication = () => {
      const isAuth = authService.isAuthenticated();
      setIsAuthenticated(isAuth);
      checkTokenStatus();
    };

    // Intentar renovar token automáticamente cuando esté a punto de expirar
    const autoRenewToken = async () => {
      const status = checkTokenStatus();
      if (status === 'expiring-soon' && !isRefreshing) {
        console.log('Token próximo a expirar, iniciando renovación automática');
        setIsRefreshing(true);
        try {
          await authService.refreshToken();
          console.log('Token renovado automáticamente');
          // Notificación silenciosa
          toast({
            title: 'Sesión extendida',
            description: 'Tu sesión ha sido renovada automáticamente.',
            variant: 'success',
            duration: 3000
          });
          setTokenStatus('valid');
        } catch (error) {
          console.error('Error en renovación automática:', error);
          // No mostrar error al usuario, se manejará en el interceptor
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar periódicamente
    const backendInterval = setInterval(checkBackendConnection, 10000);
    const authInterval = setInterval(checkAuthentication, 30000);
    const renewInterval = setInterval(autoRenewToken, 60000); // Verificar cada minuto

    // Verificar ahora
    checkBackendConnection();
    checkAuthentication();
    autoRenewToken();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(backendInterval);
      clearInterval(authInterval);
      clearInterval(renewInterval);
    };
  }, [isRefreshing, toast]);

  // Verificar estado del token
  const checkTokenStatus = () => {
    const token = authService.getToken();

    if (!token) {
      setTokenStatus('expired');
      return 'expired';
    }

    try {
      // Decodificar token para obtener expiración
      const decodedToken = parseJwt(token);

      if (!decodedToken || !decodedToken.exp) {
        setTokenStatus('expired');
        return 'expired';
      }

      const expirationTime = decodedToken.exp * 1000; // convertir a milisegundos
      const currentTime = Date.now();
      const timeToExpire = expirationTime - currentTime;

      // Si expira en menos de 5 minutos
      if (timeToExpire < 0) {
        setTokenStatus('expired');
        return 'expired';
      } else if (timeToExpire < 5 * 60 * 1000) { // 5 minutos
        setTokenStatus('expiring-soon');
        return 'expiring-soon';
      } else {
        setTokenStatus('valid');
        return 'valid';
      }
    } catch (error) {
      console.error('Error al verificar token:', error);
      setTokenStatus('expired');
      return 'expired';
    }
  };

  // Función para decodificar JWT
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error al parsear token JWT:', error);
      return null;
    }
  };

  if (!isAuthenticated) {
    return null; // No mostrar nada si no está autenticado
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOnline && (
        <div className="bg-red-500 text-white px-3 py-2 rounded-md flex items-center space-x-2 mb-2">
          <AlertCircle size={16} />
          <span>Sin conexión a internet</span>
        </div>
      )}

      {isOnline && !hasBackendConnection && (
        <div className="bg-amber-500 text-white px-3 py-2 rounded-md flex items-center space-x-2 mb-2">
          <AlertCircle size={16} />
          <span>Servidor no disponible</span>
        </div>
      )}

      {tokenStatus === 'expiring-soon' && (
        <div className="bg-amber-500 text-white px-3 py-2 rounded-md flex items-center space-x-2">
          <AlertCircle size={16} />
          <span>Renovación de sesión en progreso...</span>
          {isRefreshing && <RefreshCw size={14} className="ml-1 animate-spin" />}
        </div>
      )}

      {isOnline && hasBackendConnection && tokenStatus === 'valid' && false && (
        <div className="bg-green-500 text-white px-3 py-2 rounded-md flex items-center space-x-2">
          <CheckCircle size={16} />
          <span>Conectado</span>
        </div>
      )}
    </div>
  );
}

export function ConnectionAlert() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'error' | 'warning' | 'info'>('info');

  useEffect(() => {
    const checkConnectionStatus = () => {
      if (!navigator.onLine) {
        setMessage('Sin conexión a internet. Los datos pueden no estar actualizados.');
        setType('error');
        setShow(true);
      } else if (connectionState.hasAuthError) {
        setMessage('Tu sesión ha expirado. El sistema intentará reconectar automáticamente.');
        setType('warning');
        setShow(true);
      } else if (!connectionState.hasBackendConnection) {
        setMessage('No se puede conectar con el servidor. Usando datos almacenados localmente.');
        setType('warning');
        setShow(true);
      } else {
        setShow(false);
      }
    };

    // Verificar estado inicial
    checkConnectionStatus();

    // Configurar listeners
    window.addEventListener('online', checkConnectionStatus);
    window.addEventListener('offline', checkConnectionStatus);

    // Verificar periódicamente
    const interval = setInterval(checkConnectionStatus, 10000);

    return () => {
      window.removeEventListener('online', checkConnectionStatus);
      window.removeEventListener('offline', checkConnectionStatus);
      clearInterval(interval);
    };
  }, []);

  if (!show) return null;

  const bgColor =
    type === 'error' ? 'bg-red-500' :
    type === 'warning' ? 'bg-amber-500' :
    'bg-blue-500';

  return (
    <div className={`${bgColor} text-white px-4 py-2 text-center fixed top-0 left-0 right-0 z-50`}>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
