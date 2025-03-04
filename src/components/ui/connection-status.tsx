import { connectionState } from "@/lib/api/sync-utils";
import { cn } from "@/lib/utils";
import { AlertCircle, Server, ServerOff, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

interface ConnectionStatusProps {
  /** Si es true, muestra el componente de forma compacta */
  compact?: boolean;
  /** Si es true, muestra solo el indicador sin texto */
  iconOnly?: boolean;
  /** Clases adicionales para el componente */
  className?: string;
}

/**
 * Componente que muestra el estado de la conexión al servidor y a Internet
 */
export function ConnectionStatus({
  compact = false,
  iconOnly = false,
  className = ""
}: ConnectionStatusProps) {
  const [onlineStatus, setOnlineStatus] = useState({
    online: connectionState.isOnline,
    serverConnected: connectionState.hasBackendConnection
  });

  useEffect(() => {
    // Actualizar el estado cuando cambie la conexión
    const updateStatus = () => {
      setOnlineStatus({
        online: connectionState.isOnline,
        serverConnected: connectionState.hasBackendConnection
      });
    };

    // Escuchar eventos de cambio de conexión
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // Verificar periódicamente el estado del servidor
    const intervalId = setInterval(updateStatus, 10000);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      clearInterval(intervalId);
    };
  }, []);

  const { online, serverConnected } = onlineStatus;

  // Si todo está bien y estamos en modo compacto, no mostrar nada
  if (compact && online && serverConnected) {
    return null;
  }

  // Preparar la información según el estado de conexión
  let icon, statusText, statusColor;

  if (!online) {
    icon = <WifiOff size={iconOnly ? 20 : 16} />;
    statusText = "Sin conexión a Internet";
    statusColor = "text-destructive bg-destructive/10";
  } else if (!serverConnected) {
    icon = <ServerOff size={iconOnly ? 20 : 16} />;
    statusText = "Servidor no disponible";
    statusColor = "text-amber-500 bg-amber-500/10";
  } else {
    icon = compact ? <Wifi size={iconOnly ? 20 : 16} /> : <Server size={iconOnly ? 20 : 16} />;
    statusText = compact ? "Conectado" : "Servidor conectado";
    statusColor = "text-green-500 bg-green-500/10";
  }

  // Si solo queremos el icono
  if (iconOnly) {
    return (
      <div
        className={cn("relative", className)}
        title={statusText}
      >
        {icon}
        <span
          className={cn(
            "absolute -top-1 -right-1 w-2 h-2 rounded-full",
            online && serverConnected ? "bg-green-500" :
            online ? "bg-amber-500" : "bg-destructive"
          )}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs px-2 py-1 rounded-md",
        statusColor,
        className
      )}
    >
      {icon}
      <span>{statusText}</span>
    </div>
  );
}

/**
 * Componente que muestra alertas basadas en el estado de la conexión
 */
export function ConnectionAlert() {
  const [showAlert, setShowAlert] = useState(false);
  const [statusInfo, setStatusInfo] = useState({
    online: connectionState.isOnline,
    serverConnected: connectionState.hasBackendConnection
  });

  useEffect(() => {
    const checkStatus = () => {
      const newStatus = {
        online: connectionState.isOnline,
        serverConnected: connectionState.hasBackendConnection
      };

      // Solo mostrar alerta si cambia el estado y hay un problema
      if (
        (statusInfo.online !== newStatus.online || statusInfo.serverConnected !== newStatus.serverConnected) &&
        (!newStatus.online || !newStatus.serverConnected)
      ) {
        setShowAlert(true);
        // Ocultar alerta después de 5 segundos
        setTimeout(() => setShowAlert(false), 5000);
      }

      setStatusInfo(newStatus);
    };

    const intervalId = setInterval(checkStatus, 5000);

    // Escuchar eventos de cambio de conexión
    window.addEventListener('online', checkStatus);
    window.addEventListener('offline', checkStatus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', checkStatus);
      window.removeEventListener('offline', checkStatus);
    };
  }, [statusInfo]);

  if (!showAlert) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs">
      <div className={cn(
        "flex items-center gap-2 p-4 rounded-lg shadow-lg",
        !statusInfo.online
          ? "bg-destructive text-destructive-foreground"
          : "bg-amber-500 text-white"
      )}>
        {!statusInfo.online ? (
          <>
            <WifiOff size={18} />
            <div>
              <p className="font-semibold">Sin conexión a Internet</p>
              <p className="text-xs opacity-90">Algunas funciones no estarán disponibles</p>
            </div>
          </>
        ) : !statusInfo.serverConnected ? (
          <>
            <AlertCircle size={18} />
            <div>
              <p className="font-semibold">Problemas de conexión con el servidor</p>
              <p className="text-xs opacity-90">Intentando reconectar...</p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
