import { ReactNode } from "react";

export interface SidebarItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  items?: SidebarItem[];
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}
