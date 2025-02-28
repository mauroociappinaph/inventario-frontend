# Sistema de Control de Inventario - Frontend

## Descripción General

Este repositorio contiene la interfaz de usuario del Sistema de Control de Inventario, orientado a bares y restaurantes. La aplicación web se desarrollará utilizando React y TypeScript, con un enfoque en la experiencia del usuario mediante un diseño moderno y responsivo.

## Tecnologías Utilizadas

- **React con TypeScript:** Para construir una interfaz robusta y escalable.
- **Tailwind CSS:** Para el desarrollo de estilos y diseño responsivo.
- **Draft.js:** Para habilitar la edición de textos enriquecidos en la aplicación.
- **Zustand:** Para la gestión del estado global de la aplicación de forma sencilla y ligera.
- **Axios (u otra librería similar):** Para la comunicación con la API REST del backend.
- **Git:** Para el control de versiones, asegurando un flujo de trabajo basado en ramas.

## Características del Frontend

- **Gestión de Productos:** Permite listar, crear, editar y eliminar productos del inventario.
- **Registro de Movimientos:** Incluye formularios para registrar entradas y salidas de inventario.
- **Alertas Visuales:** Muestra notificaciones cuando el stock de un producto es inferior al umbral definido.
- **Autenticación:** Proporciona formularios de login y registro de usuarios, interactuando con el backend para la validación y manejo de tokens de seguridad.
- **Reportes:** Ofrece la visualización de informes de consumo a través de gráficos y tablas.
- **Gestión del Estado Global:** Utiliza Zustand para manejar el estado compartido de la aplicación de manera eficiente.

## Estructura del Proyecto

El proyecto se organiza en carpetas que separan componentes, páginas, estilos y definiciones de tipos. La arquitectura interna está pensada para facilitar la escalabilidad y el mantenimiento del código, manteniendo una clara separación entre la lógica de presentación y la lógica de negocio.

## Configuración y Desarrollo

- Se deben instalar todas las dependencias necesarias del proyecto.
- El desarrollo se realizará en un entorno local utilizando el servidor de desarrollo propio de React.
- Se ha configurado Tailwind CSS para los estilos globales, Draft.js para la edición de textos enriquecidos y Zustand para la gestión del estado global.
- Las interfaces y tipos se definen en archivos separados para mantener el código limpio y organizado.

## Despliegue

- El despliegue se realizará a través de Vercel.
- Cada actualización que se fusione en la rama principal (main) desencadenará un despliegue automático, actualizando la URL pública del proyecto.

## Contribución

- Se recomienda trabajar en la rama de desarrollo (develop) para integrar nuevas funcionalidades y corregir errores.
- Una vez validados los cambios, estos se fusionarán a la rama main para su despliegue en producción.

## Licencia

El proyecto se distribuye bajo la Licencia MIT.
