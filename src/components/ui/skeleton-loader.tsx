import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'rectangular' | 'text' | 'card' | 'product' | 'table-row';
  width?: string | number;
  height?: string | number;
  count?: number;
  animated?: boolean;
  className?: string;
}

export function Skeleton({
  variant = 'default',
  width,
  height,
  count = 1,
  animated = true,
  className,
  ...props
}: SkeletonProps) {
  // Base classes for all skeleton variants
  const baseClasses = cn(
    'bg-gray-200 dark:bg-gray-700 rounded',
    animated && 'animate-pulse',
    className
  );

  // Get style based on width and height props
  const getStyle = () => {
    const style: React.CSSProperties = {};

    if (width) {
      style.width = typeof width === 'number' ? `${width}px` : width;
    }

    if (height) {
      style.height = typeof height === 'number' ? `${height}px` : height;
    }

    return style;
  };

  // Render different variants
  const renderSkeleton = () => {
    switch (variant) {
      case 'circular':
        return (
          <div
            className={cn(baseClasses, 'rounded-full')}
            style={{
              ...getStyle(),
              width: width || '40px',
              height: height || '40px'
            }}
            {...props}
          />
        );

      case 'text':
        return (
          <div
            className={cn(baseClasses, 'h-4 w-full max-w-full')}
            style={getStyle()}
            {...props}
          />
        );

      case 'card':
        return (
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden" {...props}>
            <div className={cn(baseClasses, 'h-48 w-full')} />
            <div className="p-4 space-y-3">
              <div className={cn(baseClasses, 'h-5 w-2/3')} />
              <div className={cn(baseClasses, 'h-4 w-full')} />
              <div className={cn(baseClasses, 'h-4 w-full')} />
              <div className="flex justify-between pt-4">
                <div className={cn(baseClasses, 'h-8 w-24')} />
                <div className={cn(baseClasses, 'h-8 w-16')} />
              </div>
            </div>
          </div>
        );

      case 'product':
        return (
          <div className="border rounded-md p-4">
            <div className={cn(baseClasses, 'h-40 mb-4')} />
            <div className="space-y-2">
              <div className={cn(baseClasses, 'h-5 w-3/4')} />
              <div className={cn(baseClasses, 'h-4 w-1/2')} />
              <div className={cn(baseClasses, 'h-6 w-1/4')} />
              <div className="flex justify-between mt-4">
                <div className={cn(baseClasses, 'h-8 w-20')} />
                <div className={cn(baseClasses, 'h-8 w-8 rounded-full')} />
              </div>
            </div>
          </div>
        );

      case 'table-row':
        return (
          <div className="flex w-full border-b py-3">
            <div className={cn(baseClasses, 'h-6 w-1/12 mr-2')} />
            <div className={cn(baseClasses, 'h-6 w-2/12 mr-2')} />
            <div className={cn(baseClasses, 'h-6 w-3/12 mr-2')} />
            <div className={cn(baseClasses, 'h-6 w-2/12 mr-2')} />
            <div className={cn(baseClasses, 'h-6 w-2/12 mr-2')} />
            <div className={cn(baseClasses, 'h-6 w-2/12')} />
          </div>
        );

      case 'rectangular':
      case 'default':
      default:
        return (
          <div
            className={baseClasses}
            style={{
              ...getStyle(),
              width: width || '100%',
              height: height || '20px'
            }}
            {...props}
          />
        );
    }
  };

  // Render multiple items if count > 1
  if (count > 1) {
    return (
      <div className="space-y-2">
        {[...Array(count)].map((_, i) => (
          <React.Fragment key={i}>
            {renderSkeleton()}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Render single item
  return renderSkeleton();
}

export default Skeleton;
