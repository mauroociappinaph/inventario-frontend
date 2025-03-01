import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// Rutas públicas que no requieren autenticación
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

// Rutas que requieren autenticación
const protectedRoutes = [
  '/dashboard',
  '/products',
  '/inventory',
  '/orders',
  '/suppliers',
  '/categories',
  '/settings',
  '/profile'
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // DESARROLLO: Comentado para permitir acceso sin autenticación
  // Si es una ruta pública, permitir acceso
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // Si el usuario ya está autenticado y trata de acceder a login/register, redirigir al dashboard
    if (token && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // DESARROLLO: Comentado para permitir acceso sin autenticación
  /*
  // Si es una ruta protegida y el usuario no está autenticado, redirigir al login
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    const redirectUrl = new URL('/login', request.url);
    // Guardar la URL original para redirigir después del login
    redirectUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  */

  // Si es la ruta raíz, redirigir según autenticación
  if (pathname === '/') {
    // DESARROLLO: Siempre ir al dashboard en desarrollo
    return NextResponse.redirect(new URL('/dashboard', request.url));

    /* PRODUCCIÓN: Descomentar esto para producción
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    */
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)',
  ],
};
