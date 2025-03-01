# Sistema de Control de Inventario - Frontend

## Descripción General

Este repositorio contiene la interfaz de usuario del Sistema de Control de Inventario, orientado a bares y restaurantes. La aplicación web se desarrollará utilizando Next.js y TypeScript, con un enfoque en la experiencia del usuario mediante un diseño moderno y responsivo.

## Tecnologías Utilizadas

- **Next.js con TypeScript:** Para construir una interfaz robusta y escalable con renderizado del lado del servidor (SSR) y generación estática (SSG).
- **App Router:** Para aprovechar las últimas características de enrutamiento de Next.js.
- **Tailwind CSS:** Para el desarrollo de estilos y diseño responsivo.
- **Tiptap o Lexical:** Para habilitar la edición de textos enriquecidos en la aplicación.
- **Zustand:** Para la gestión del estado global de la aplicación de forma sencilla y ligera.
- **Next.js API Routes:** Para la comunicación con el backend, con la opción de usar SWR o React Query para la gestión de datos.
- **Git:** Para el control de versiones, asegurando un flujo de trabajo basado en ramas.

## Características del Frontend

- **Renderizado Optimizado:** Aprovecha el SSR y SSG de Next.js para mejorar el rendimiento y SEO.
- **Gestión de Productos:** Permite listar, crear, editar y eliminar productos del inventario.
- **Registro de Movimientos:** Incluye formularios para registrar entradas y salidas de inventario.
- **Alertas Visuales:** Muestra notificaciones cuando el stock de un producto es inferior al umbral definido.
- **Integración con Autenticación NestJS:** Implementa la interfaz de usuario para login y registro, consumiendo los endpoints de autenticación del backend NestJS y gestionando los tokens JWT.
- **Middleware de Protección de Rutas:** Utiliza middleware de Next.js para proteger rutas que requieren autenticación, verificando la validez del token JWT.
- **Reportes:** Ofrece la visualización de informes de consumo a través de gráficos y tablas.
- **Gestión del Estado Global:** Utiliza Zustand para manejar el estado compartido de la aplicación de manera eficiente.
- **Modo Offline:** Implementa estrategias para funcionar con conectividad limitada usando Next.js PWA.

## Estructura del Proyecto

El proyecto sigue la estructura recomendada por Next.js con el App Router:

```
/app
  /api        # API Routes para comunicación con el backend
  /(routes)   # Rutas de la aplicación organizadas por funcionalidad
/components   # Componentes reutilizables
/lib          # Utilidades y funciones auxiliares
  /auth       # Funciones de autenticación y manejo de tokens JWT
/public       # Archivos estáticos
/store        # Estado global con Zustand
/styles       # Estilos globales y configuración de Tailwind
/middleware.ts # Middleware para protección de rutas
```

## Configuración y Desarrollo

- Se deben instalar todas las dependencias necesarias del proyecto.
- El desarrollo se realizará en un entorno local utilizando el servidor de desarrollo de Next.js.
- Se ha configurado Tailwind CSS para los estilos globales y Zustand para la gestión del estado global.
- Las interfaces y tipos se definen en archivos separados para mantener el código limpio y organizado.

## Despliegue

- El despliegue se realizará a través de Vercel, plataforma optimizada para aplicaciones Next.js.
- Cada actualización que se fusione en la rama principal (main) desencadenará un despliegue automático, actualizando la URL pública del proyecto.
- Se configurarán variables de entorno para los diferentes entornos (desarrollo, pruebas, producción).

## Contribución

- Se recomienda trabajar en la rama de desarrollo (develop) para integrar nuevas funcionalidades y corregir errores.
- Una vez validados los cambios, estos se fusionarán a la rama main para su despliegue en producción.

## Licencia

El proyecto se distribuye bajo la Licencia MIT.
