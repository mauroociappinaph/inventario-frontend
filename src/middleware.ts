import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que requieren autenticación
const PROTECTED_ROUTES = [
  '/dashboard',
  '/products',
  '/suppliers',
  '/inventory',
  '/orders',
  '/analytics',
  '/settings',
];

// Rutas públicas (no requieren autenticación)
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Si es una ruta de API o un archivo estático, no aplicar el middleware
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  // Comprobar si la ruta actual es protegida
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Si no es una ruta protegida, continuar normalmente
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Obtener el token de autenticación desde las cookies
  const authToken = request.cookies.get('auth_token')?.value || '';

  // Si no hay token y es una ruta protegida, redirigir al login
  if (!authToken) {
    // Crear URL para redirigir con el parámetro callbackUrl
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);

    return NextResponse.redirect(url);
  }

  // Si hay token, permitir el acceso a la ruta protegida
  return NextResponse.next();
}

// Configurar el middleware para que se ejecute sólo en rutas específicas
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto las que comienzan con:
     * - api (rutas API)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (icono del sitio)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
