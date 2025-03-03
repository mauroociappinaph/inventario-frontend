import { useAppTheme } from '@/hooks/useAppTheme';
import { cn } from '@/lib/utils';
import { ChevronDown, Monitor, Moon, Sun } from 'lucide-react';
import { Button } from './button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './dropdown-menu';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'icon' | 'button' | 'switch' | 'dropdown';
}

export function ThemeToggle({
  className,
  showLabel = false,
  variant = 'switch'
}: ThemeToggleProps) {
  const {
    isDarkTheme,
    toggleTheme,
    themeMode,
    changeThemeMode,
    effectiveTheme
  } = useAppTheme();

  // Dropdown menu variant
  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg",
              className
            )}
          >
            {themeMode === 'system' ? (
              <Monitor className="h-4 w-4" />
            ) : themeMode === 'dark' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            {showLabel && (
              <>
                <span className="text-sm">
                  {themeMode === 'system'
                    ? 'Sistema'
                    : themeMode === 'dark'
                      ? 'Oscuro'
                      : 'Claro'
                  }
                </span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => changeThemeMode('light')}>
            <Sun className="h-4 w-4 mr-2" />
            <span>Claro</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => changeThemeMode('dark')}>
            <Moon className="h-4 w-4 mr-2" />
            <span>Oscuro</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => changeThemeMode('system')}>
            <Monitor className="h-4 w-4 mr-2" />
            <span>Sistema</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Variante tipo switch
  if (variant === 'switch') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          "relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isDarkTheme ? "bg-gray-800" : "bg-slate-200",
          className
        )}
        aria-label={isDarkTheme ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      >
        <span
          className={cn(
            "pointer-events-none absolute left-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition-transform",
            isDarkTheme ? "translate-x-7" : "translate-x-0"
          )}
        >
          {isDarkTheme ? (
            <Moon className="h-4 w-4 text-gray-800" />
          ) : (
            <Sun className="h-4 w-4 text-yellow-500" />
          )}
        </span>
      </button>
    );
  }

  // Variante tipo botón
  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
          isDarkTheme
            ? "bg-gray-800 text-gray-100 hover:bg-gray-700"
            : "bg-slate-200 text-slate-800 hover:bg-slate-300",
          className
        )}
        aria-label={isDarkTheme ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      >
        {isDarkTheme ? (
          <Sun className="h-4 w-4 text-yellow-300" />
        ) : (
          <Moon className="h-4 w-4 text-gray-800" />
        )}
        {showLabel && (
          <span className="text-sm font-medium">
            {isDarkTheme ? "Cambiar a claro" : "Cambiar a oscuro"}
          </span>
        )}
      </button>
    );
  }

  // Variante de solo ícono (predeterminada)
  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "p-2 rounded-full transition-colors",
        isDarkTheme
          ? "bg-gray-800 text-yellow-300 hover:bg-gray-700"
          : "bg-slate-200 text-gray-800 hover:bg-slate-300",
        className
      )}
      aria-label={isDarkTheme ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
    >
      {isDarkTheme ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
