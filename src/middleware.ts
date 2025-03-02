import { NextResponse, NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// Rutas públicas que no requieren autenticación
const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password'];

// Rutas que requieren autenticación con rol de administrador
const adminRoutes = [
  '/dashboard',
  '/dashboard/products',
  '/dashboard/products/categories',
  '/dashboard/orders',
  '/dashboard/users',
  '/dashboard/stats',
  '/dashboard/settings',
  '/dashboard/help',
  '/dashboard/inventory',
];

// Rutas que requieren autenticación para usuarios normales
const userRoutes = [
  '/user-dashboard',
  '/profile',
  '/user-dashboard/inventory',
  '/user-dashboard/products'
];

// Todas las rutas protegidas
const protectedRoutes = [...adminRoutes, ...userRoutes];

// Estructura del token JWT (simplificada)
interface JwtPayload {
  id: string;
  email: string;
  roles?: string[];
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Si es una ruta pública, permitir acceso
  if (publicRoutes.some(route => pathname === route || pathname.startsWith('/api/'))) {
    // Si el usuario ya está autenticado y trata de acceder a login/register, redirigir al dashboard según rol
    if (token && (pathname === '/login' || pathname === '/register')) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const roles = decoded.roles || [];

        if (roles.includes('admin')) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        } else {
          return NextResponse.redirect(new URL('/user-dashboard', request.url));
        }
      } catch (error) {
        // Si hay error decodificando el token, redirigir a ruta por defecto
        return NextResponse.redirect(new URL('/user-dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  // Si es una ruta protegida y el usuario no está autenticado, redirigir al login
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    const redirectUrl = new URL('/login', request.url);
    // Guardar la URL original para redirigir después del login
    redirectUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Control de acceso basado en roles para rutas de administrador
  if (adminRoutes.some(route => pathname.startsWith(route)) && token) {
    try {
      // Intentar decodificar el token para verificar el rol
      const decoded = jwtDecode<JwtPayload>(token);
      const roles = decoded.roles || [];

      // Si el usuario no es admin, redirigir al dashboard de usuario
      if (!roles.includes('admin')) {
        return NextResponse.redirect(new URL('/user-dashboard', request.url));
      }
    } catch (error) {
      // Si hay error al decodificar, considerar que no es admin
      return NextResponse.redirect(new URL('/user-dashboard', request.url));
    }
  }

  // Control de acceso basado en roles para rutas de usuario regular
  if (userRoutes.some(route => pathname.startsWith(route)) && token) {
    try {
      // Intentar decodificar el token para verificar el rol
      const decoded = jwtDecode<JwtPayload>(token);
      const roles = decoded.roles || [];

      // Si el usuario es admin, permitirle acceder a las rutas de usuario normal
      // (No redirigir, los administradores pueden ver todo)
      if (roles.includes('admin')) {
        return NextResponse.next();
      }
    } catch (error) {
      // En caso de error, permitir acceso a rutas de usuario
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|images|fonts).*)',
  ],
};
