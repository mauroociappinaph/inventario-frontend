"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";

interface NextLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function NextLogo({ className = "", width = 180, height = 37 }: NextLogoProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const didRunEffect = useRef(false);

  // Utilizamos useRef para evitar múltiples renderizados
  useEffect(() => {
    // Solo ejecutamos el efecto una vez
    if (!didRunEffect.current) {
      didRunEffect.current = true;
      // Marcar como cargado después de un breve retraso sin usar setTimeout
      requestAnimationFrame(() => {
        setIsLoaded(true);
      });
    }
  }, []);

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src="/next.svg"
        alt="Next.js Logo"
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        width={width}
        height={height}
        priority
      />
    </div>
  );
}
