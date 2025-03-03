"use client";

import { useAuth } from "@/context/auth-context";
import {
  BarChart3,
  Bell,
  ChevronDown,
  Home,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  User,
  UserCircle
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeHelpDialog } from '../theme-help-dialog';
import { Button } from "./button";
import { Avatar, AvatarFallback } from "./simple-avatar";
import { ThemeToggle } from './theme-toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Sólo mostrar el contenido cuando estamos en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar el menú de usuario al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Elementos de navegación fijos (siempre visibles)
  const fixedNavItems = [
    { path: "/", label: "Inicio", icon: <Home className="h-4 w-4" /> },
    ...(isAuthenticated ? [
      {
        path: user?.roles?.includes('admin') ? "/dashboard" : "/user-dashboard",
        label: "Dashboard",
        icon: <BarChart3 className="h-4 w-4" />
      },
      {
        path: user?.roles?.includes('admin') ? "/dashboard/inventory" : "/user-dashboard/inventory",
        label: "Inventario",
        icon: <Package className="h-4 w-4" />
      },
      {
        path: user?.roles?.includes('admin') ? "/dashboard/products" : "/user-dashboard/products",
        label: "Productos",
        icon: <ShoppingCart className="h-4 w-4" />
      }
    ] : [])
  ];

  // Elementos para usuarios autenticados
  const authNavItems = [
    { path: "/profile", label: "Mi Perfil", icon: <UserCircle className="h-4 w-4" /> },
    { path: "/orders", label: "Pedidos", icon: <ShoppingCart className="h-4 w-4" /> },
    { path: "/settings", label: "Configuración", icon: <Settings className="h-4 w-4" /> },
  ];

  // Elementos de navegación para usuarios no autenticados
  const guestNavItems = [
    { path: "/login", label: "Iniciar Sesión", icon: <UserCircle className="h-4 w-4" /> },
    { path: "/register", label: "Registrarse", icon: <User className="h-4 w-4" /> },
  ];

  // Obtener iniciales del usuario para el avatar
  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Cambiar el tema entre claro y oscuro
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Cerrar sesión y cerrar menús
  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-sky-100 border-b border-sky-200 shadow-sm dark:bg-sky-900 dark:border-sky-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Package className="h-6 w-6 text-sky-600 dark:text-sky-400" />
              <span className="font-bold text-sky-700 dark:text-sky-300">InvSystem</span>
            </Link>
          </div>

          {/* Navegación desktop */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {/* Elementos fijos de navegación */}
              {fixedNavItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${isActive
                        ? "bg-sky-500 text-white"
                        : "text-sky-700 hover:bg-sky-200 dark:text-sky-300 dark:hover:bg-sky-800"
                      }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}

              {/* Separador entre elementos fijos y condicionales */}
              <div className="border-l border-sky-300 dark:border-sky-700 h-6"></div>

              {/* Elementos condicionales basados en autenticación */}
              {!isAuthenticated ? (
                // Mostrar elementos para visitantes
                guestNavItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${isActive
                          ? "bg-sky-500 text-white"
                          : "text-sky-700 hover:bg-sky-200 dark:text-sky-300 dark:hover:bg-sky-800"
                        }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  );
                })
              ) : (
                // Mostrar elementos para usuarios autenticados
                <div className="flex items-center gap-4">
                  {/* Notificaciones */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="Notificaciones"
                  >
                    <Bell className="h-5 w-5 text-sky-700 dark:text-sky-300" />
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                  </Button>

                  {/* Botón de cerrar sesión */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleLogout}
                          className="relative"
                          aria-label="Cerrar sesión"
                        >
                          <LogOut className="h-5 w-5 text-sky-700 dark:text-sky-300" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Cerrar sesión</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Usuario y menú desplegable */}
                  <div className="relative" ref={userMenuRef}>
                    <Button
                      variant="ghost"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarFallback>
                          {user?.name ? getUserInitials(user.name) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sky-700 dark:text-sky-300 hidden sm:inline">
                        {user?.name || 'Usuario'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-sky-700 dark:text-sky-300" />
                    </Button>

                    {/* Menú desplegable */}
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-sky-800 ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          {authNavItems.map((item) => (
                            <Link
                              key={item.path}
                              href={item.path}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-sky-700 hover:bg-sky-100 dark:text-sky-200 dark:hover:bg-sky-700"
                            >
                              {item.icon}
                              {item.label}
                            </Link>
                          ))}
                          <div className="border-t border-sky-200 dark:border-sky-700 my-1"></div>
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-sky-100 dark:text-red-400 dark:hover:bg-sky-700 w-full text-left"
                          >
                            <LogOut className="h-4 w-4" />
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Botón para cambiar el tema */}
              {mounted && (
                <div className="flex items-center gap-1">
                  <ThemeToggle
                    variant="dropdown"
                    showLabel={true}
                    className="ml-2"
                  />
                  <ThemeHelpDialog />
                </div>
              )}
            </div>
          </div>

          {/* Menú móvil */}
          <div className="md:hidden flex items-center gap-2">
            {/* Botón para cambiar el tema en móvil */}
            {mounted && (
              <ThemeToggle
                variant="icon"
                className="mr-2"
              />
            )}

            {/* Mostrar icono de usuario o menú de hamburguesa */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1"
            >
              {isAuthenticated ? (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.name ? getUserInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <svg
                  className="h-6 w-6 text-sky-700 dark:text-sky-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </Button>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        {mobileMenuOpen && (
          <div className="md:hidden py-2 border-t border-sky-200 dark:border-sky-700">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {/* Elementos fijos */}
              {fixedNavItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive
                        ? "bg-sky-500 text-white"
                        : "text-sky-700 hover:bg-sky-200 dark:text-sky-300 dark:hover:bg-sky-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      {item.label}
                    </div>
                  </Link>
                );
              })}

              {/* Separador */}
              <div className="border-t border-sky-200 dark:border-sky-700 my-2"></div>

              {/* Elementos condicionales */}
              {isAuthenticated ? (
                <>
                  {/* Elementos para usuarios autenticados */}
                  {authNavItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-3 py-2 rounded-md text-base font-medium ${
                          isActive
                            ? "bg-sky-500 text-white"
                            : "text-sky-700 hover:bg-sky-200 dark:text-sky-300 dark:hover:bg-sky-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {item.icon}
                          {item.label}
                        </div>
                      </Link>
                    );
                  })}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 border border-red-200 mt-2 dark:text-red-400 dark:hover:bg-red-900/20 dark:border-red-800"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Cerrar Sesión
                    </div>
                  </button>
                </>
              ) : (
                <>
                  {/* Elementos para usuarios no autenticados */}
                  {guestNavItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-3 py-2 rounded-md text-base font-medium ${
                          isActive
                            ? "bg-sky-500 text-white"
                            : "text-sky-700 hover:bg-sky-200 dark:text-sky-300 dark:hover:bg-sky-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {item.icon}
                          {item.label}
                        </div>
                      </Link>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
