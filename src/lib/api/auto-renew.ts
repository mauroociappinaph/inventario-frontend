/**
 * Sistema de renovación automática de tokens
 *
 * Este módulo maneja la renovación automática de tokens de autenticación
 * sin intervención manual del usuario.
 */

import authService from './auth-service';
import { connectionState, initConnectionListeners } from './sync-utils';

// Intervalo de verificación en milisegundos (cada 2 minutos)
const TOKEN_CHECK_INTERVAL = 2 * 60 * 1000;

// Tiempo antes de la expiración para iniciar renovación (5 minutos)
const RENEW_THRESHOLD = 5 * 60 * 1000;

let checkInterval: NodeJS.Timeout | null = null;
let isInitialized = false;

/**
 * Decodifica un token JWT para obtener su payload
 */
function parseJwt(token: string) {
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
}

/**
 * Verifica el token actual y lo renueva si es necesario
 */
async function checkAndRenewToken() {
  if (typeof window === 'undefined') return; // No ejecutar en SSR

  // No hacer nada si no hay conexión a internet o al backend
  if (!connectionState.isOnline || !connectionState.hasBackendConnection) {
    return;
  }

  // Obtener el token actual
  const token = authService.getToken();
  if (!token) return;

  try {
    // Decodificar token para obtener expiración
    const decodedToken = parseJwt(token);
    if (!decodedToken || !decodedToken.exp) return;

    const expirationTime = decodedToken.exp * 1000; // convertir a milisegundos
    const currentTime = Date.now();
    const timeToExpire = expirationTime - currentTime;

    // Si expira pronto, renovar automáticamente
    if (timeToExpire > 0 && timeToExpire < RENEW_THRESHOLD) {
      console.log(`Token expira en ${Math.round(timeToExpire / 1000)} segundos. Iniciando renovación automática...`);

      // Intentar renovar
      await authService.refreshToken();

      // Restablecer bandera de error de autenticación si existe
      if (connectionState.hasAuthError) {
        connectionState.hasAuthError = false;
      }

      console.log('Token renovado automáticamente con éxito');
    }
  } catch (error) {
    console.error('Error en verificación o renovación automática del token:', error);
    // No hacer nada más, se manejará en el interceptor si hay solicitudes
  }
}

/**
 * Inicializa el sistema de renovación automática de tokens
 */
export function initAutoRenew() {
  if (isInitialized || typeof window === 'undefined') return;

  console.log('Iniciando sistema de renovación automática de tokens');

  // Inicializar listeners de conexión para el sistema general
  initConnectionListeners();

  // Configurar verificación periódica del token
  checkInterval = setInterval(checkAndRenewToken, TOKEN_CHECK_INTERVAL);

  // Verificar token ahora
  checkAndRenewToken();

  isInitialized = true;

  // También verificar cuando la ventana vuelve a tener foco
  window.addEventListener('focus', () => {
    checkAndRenewToken();
  });
}

/**
 * Detiene el sistema de renovación automática
 */
export function stopAutoRenew() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
  isInitialized = false;
}

/**
 * Obtiene el estado actual de autenticación y renovación
 */
export function getAuthStatus() {
  const token = authService.getToken();
  if (!token) {
    return {
      isAuthenticated: false,
      tokenStatus: 'missing',
      timeToExpire: 0
    };
  }

  try {
    const decodedToken = parseJwt(token);
    if (!decodedToken || !decodedToken.exp) {
      return {
        isAuthenticated: false,
        tokenStatus: 'invalid',
        timeToExpire: 0
      };
    }

    const expirationTime = decodedToken.exp * 1000;
    const currentTime = Date.now();
    const timeToExpire = expirationTime - currentTime;

    let tokenStatus: 'valid' | 'expiring-soon' | 'expired';

    if (timeToExpire < 0) {
      tokenStatus = 'expired';
    } else if (timeToExpire < RENEW_THRESHOLD) {
      tokenStatus = 'expiring-soon';
    } else {
      tokenStatus = 'valid';
    }

    return {
      isAuthenticated: timeToExpire > 0,
      tokenStatus,
      timeToExpire,
      expirationDate: new Date(expirationTime),
      user: authService.getCurrentUser()
    };
  } catch (error) {
    console.error('Error al obtener estado de autenticación:', error);
    return {
      isAuthenticated: false,
      tokenStatus: 'error',
      timeToExpire: 0,
      error
    };
  }
}
