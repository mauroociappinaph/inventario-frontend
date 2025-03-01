'use client';

import React from 'react';
import { AlertCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ErrorSeverity = 'error' | 'warning' | 'info';

interface ErrorMessageProps {
  title?: string;
  message: string;
  severity?: ErrorSeverity;
  className?: string;
  onDismiss?: () => void;
}

const iconMap = {
  error: <XCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />
};

const styleMap = {
  error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-800/40',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-300 dark:border-yellow-800/40',
  info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-800/40'
};

export function ErrorMessage({
  title,
  message,
  severity = 'error',
  className,
  onDismiss
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-md border',
        styleMap[severity],
        className
      )}
    >
      <div className="shrink-0 mt-0.5">
        {iconMap[severity]}
      </div>

      <div className="flex-1">
        {title && (
          <h4 className="font-medium text-sm mb-1">{title}</h4>
        )}
        <p className="text-sm opacity-90">{message}</p>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 opacity-70 hover:opacity-100 rounded-full p-1"
          aria-label="Cerrar"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
