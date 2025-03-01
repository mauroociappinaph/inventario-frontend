"use client"

import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
}

export function Avatar({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-sky-100 dark:bg-sky-800",
        className
      )}
      {...props}
    />
  )
}

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
}

export function AvatarImage({
  className,
  src,
  alt = "",
  ...props
}: AvatarImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  )
}

export function AvatarFallback({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-sky-100 text-sky-800 dark:bg-sky-800 dark:text-sky-200 text-sm font-medium",
        className
      )}
      {...props}
    />
  )
}
