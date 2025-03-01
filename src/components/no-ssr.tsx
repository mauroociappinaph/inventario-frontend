"use client";

import { useEffect, useState } from "react";

export default function NoSSR({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Eliminar atributos problemáticos añadidos por extensiones
    const cleanup = () => {
      const html = document.documentElement;
      if (html.hasAttribute("data-lt-installed")) {
        html.removeAttribute("data-lt-installed");
      }

      const body = document.body;
      if (body.hasAttribute("cz-shortcut-listen")) {
        body.removeAttribute("cz-shortcut-listen");
      }
    };

    cleanup();

    // Ejecutar la limpieza periódicamente para manejar extensiones que puedan añadir atributos después
    const interval = setInterval(cleanup, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return fallback;
  }

  return <>{children}</>;
}
