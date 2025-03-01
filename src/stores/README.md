# Gestión de Estado y ActionTypes

## Introducción

Este proyecto utiliza Zustand como librería de gestión de estado, complementada con un sistema centralizado de `actionTypes` para mejorar la trazabilidad, documentación y mantenimiento del código.

## Estructura

La gestión de estado se organiza en tres stores principales:

- **uiStore**: Gestiona el estado de la interfaz de usuario (sidebar, tema, navegación)
- **errorStore**: Maneja los errores y su visualización
- **inventoryStore**: Controla el estado del inventario (productos, categorías, proveedores)

## ActionTypes

Los tipos de acciones están definidos en `actionTypes.ts` y categorizados por store. Esto proporciona:

1. **Centralización**: Todos los tipos de acciones están en un solo lugar
2. **Documentación implícita**: Los nombres descriptivos documentan qué acciones existen
3. **Prevención de errores**: Evita errores tipográficos al usar constantes
4. **Trazabilidad**: Facilita el seguimiento de acciones en la aplicación

## Implementación en Stores

Los stores utilizan los actionTypes importándolos y registrando cada acción:

```typescript
import { UI_ACTIONS } from './actionTypes';

// En la definición de acciones:
setActiveItemId: (id) => {
  console.log(`Dispatching action: ${UI_ACTIONS.SET_ACTIVE_ITEM_ID}`);
  set({ activeItemId: id });
},
```

## Rastreo de Acciones

Adicionalmente, se proporciona un módulo `actionTracker` que permite:

1. Registrar acciones con su payload
2. Mantener un historial de acciones
3. Acceder a la última acción ejecutada
4. Limpiar el historial cuando sea necesario

Uso:

```typescript
import { trackAction } from '@/stores/middleware/actionTracker';

// En una acción de store
setActiveItemId: (id) => {
  trackAction(UI_ACTIONS.SET_ACTIVE_ITEM_ID, { id });
  set({ activeItemId: id });
},
```

## Beneficios

- **Depuración**: Facilita la identificación de problemas en el flujo de acciones
- **Mantenimiento**: Ayuda a entender el estado y las acciones disponibles
- **Extensibilidad**: Facilita la adición de nuevas acciones de manera organizada
- **Testing**: Permite verificar qué acciones se están ejecutando

## Mejores Prácticas

1. **Siempre utiliza constantes**: No uses strings directos para tipos de acciones
2. **Mantén los nombres descriptivos**: Las acciones deben describir claramente qué hacen
3. **Agrupa por dominio**: Separa las acciones en categorías lógicas
4. **Utiliza el rastreador**: Para acciones críticas, usa `trackAction` para más detalles
