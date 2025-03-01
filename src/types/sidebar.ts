import { IconType } from 'react-icons';
import { LucideIcon } from 'lucide-react';

/**
 * Tipo unión para iconos, soporta tanto LucideIcons como react-icons
 */
export type IconComponent = LucideIcon | IconType;

/**
 * Tipo para un ítem individual del sidebar
 */
export interface SidebarItemType {
  id: string;
  title: string;
  href?: string;
  icon?: IconComponent;
  children?: SidebarItemType[];
  disabled?: boolean;
  external?: boolean;
  label?: string;
}

/**
 * Tipo para una sección del sidebar (agrupación de ítems)
 */
export interface SidebarSection {
  title?: string;
  items?: SidebarItemType[];
}

/**
 * Variantes del sidebar
 */
export type SidebarVariant = 'default' | 'compact';

/**
 * Verifica si un ítem tiene hijos
 */
export const hasChildren = (item: SidebarItemType): boolean => {
  return !!item.children && item.children.length > 0;
};

/**
 * Encuentra un ítem por ID en un array de secciones
 */
export const findItemById = (
  sections: SidebarSection[],
  id: string
): SidebarItemType | undefined => {
  for (const section of sections) {
    if (!section.items) continue;

    // Buscar en el primer nivel
    const item = section.items.find(item => item.id === id);
    if (item) return item;

    // Buscar en los hijos
    for (const parentItem of section.items) {
      if (!parentItem.children) continue;

      const childItem = parentItem.children.find(child => child.id === id);
      if (childItem) return childItem;
    }
  }

  return undefined;
};

/**
 * Encuentra el padre de un ítem por ID
 */
export const findParentById = (
  sections: SidebarSection[],
  childId: string
): SidebarItemType | undefined => {
  for (const section of sections) {
    if (!section.items) continue;

    for (const item of section.items) {
      if (!item.children) continue;

      if (item.children.some(child => child.id === childId)) {
        return item;
      }
    }
  }

  return undefined;
};
