# Sistema de Diseño de InvSystem

Este directorio contiene el sistema de diseño centralizado para InvSystem, proporcionando una fuente única de verdad para todos los componentes, tokens y patrones de UI.

## Estructura

- `tokens.ts` - Contiene todos los tokens de diseño (colores, espaciado, tipografía, etc.)
- `index.ts` - Punto de entrada principal para importar componentes y tokens
- `components/` - (Futuro) Componentes personalizados del sistema de diseño

## Uso

Para usar los tokens del sistema de diseño en cualquier componente:

```tsx
import { SPACING, COLORS, ICON_SIZES } from "@/design-system";

function MyComponent() {
  return (
    <div className={`p-${SPACING.md} text-${COLORS.primary.DEFAULT}`}>
      <Icon className={ICON_SIZES.md} />
      Contenido del componente
    </div>
  );
}
```

## Principios de Diseño

1. **Consistencia**: Usar siempre los tokens definidos, no valores arbitrarios
2. **Modularidad**: Componentes independientes que se pueden combinar
3. **Accesibilidad**: Todos los componentes deben ser accesibles
4. **Escalabilidad**: El sistema debe adaptarse a diferentes tamaños de pantalla

## Extensión

Para añadir nuevos tokens:

1. Definir el nuevo token en `tokens.ts`
2. Documentar su propósito y uso
3. Exportarlo a través de `index.ts`
