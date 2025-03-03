import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Info, Keyboard, Monitor, Moon, Paintbrush, Sun } from 'lucide-react';
import React from 'react';

interface ShortcutItemProps {
  keys: string[];
  description: string;
  icon?: React.ReactNode;
}

function ShortcutItem({ keys, description, icon }: ShortcutItemProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        {icon}
        <span>{description}</span>
      </div>
      <div className="flex gap-1">
        {keys.map((key, i) => (
          <React.Fragment key={i}>
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
              {key}
            </kbd>
            {i < keys.length - 1 && <span className="mx-1">+</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export function ThemeHelpDialog() {
  const { themeMode, changeThemeMode } = useAppTheme();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Ayuda sobre el tema">
          <Info className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5" />
            Opciones de tema y atajos
          </DialogTitle>
          <DialogDescription>
            Personaliza la apariencia de la aplicación
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Modos de tema */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Paintbrush className="h-4 w-4" />
              Modos de tema
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={themeMode === 'light' ? "default" : "outline"}
                className="flex flex-col items-center gap-2 py-4"
                onClick={() => changeThemeMode('light')}
              >
                <Sun className="h-5 w-5" />
                <span className="text-xs">Claro</span>
              </Button>
              <Button
                variant={themeMode === 'dark' ? "default" : "outline"}
                className="flex flex-col items-center gap-2 py-4"
                onClick={() => changeThemeMode('dark')}
              >
                <Moon className="h-5 w-5" />
                <span className="text-xs">Oscuro</span>
              </Button>
              <Button
                variant={themeMode === 'system' ? "default" : "outline"}
                className="flex flex-col items-center gap-2 py-4"
                onClick={() => changeThemeMode('system')}
              >
                <Monitor className="h-5 w-5" />
                <span className="text-xs">Sistema</span>
              </Button>
            </div>
          </div>

          {/* Atajos de teclado */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Atajos de teclado
            </h3>
            <div className="space-y-2 border rounded-md p-3">
              <ShortcutItem
                keys={["Shift", "L"]}
                description="Cambiar a tema claro"
                icon={<Sun className="h-4 w-4" />}
              />
              <ShortcutItem
                keys={["Shift", "D"]}
                description="Cambiar a tema oscuro"
                icon={<Moon className="h-4 w-4" />}
              />
              <ShortcutItem
                keys={["Shift", "S"]}
                description="Usar tema del sistema"
                icon={<Monitor className="h-4 w-4" />}
              />
              <ShortcutItem
                keys={["Shift", "T"]}
                description="Alternar entre claro/oscuro"
                icon={<Paintbrush className="h-4 w-4" />}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
