"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "table-row" | "card" | "image" | "text";
  count?: number;
}

export function Skeleton({
  className,
  variant = "default",
  count = 1,
  ...props
}: SkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case "table-row":
        return Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="py-3 animate-pulse flex gap-3 items-center border-b border-sky-200 dark:border-sky-700"
          >
            <div className="h-4 w-[5%] bg-sky-200 dark:bg-sky-800 rounded"></div>
            <div className="h-4 w-[30%] bg-sky-200 dark:bg-sky-800 rounded"></div>
            <div className="h-4 w-[15%] bg-sky-200 dark:bg-sky-800 rounded"></div>
            <div className="h-4 w-[10%] bg-sky-200 dark:bg-sky-800 rounded"></div>
            <div className="h-4 w-[15%] bg-sky-200 dark:bg-sky-800 rounded"></div>
            <div className="h-4 w-[15%] bg-sky-200 dark:bg-sky-800 rounded"></div>
            <div className="h-4 w-[10%] bg-sky-200 dark:bg-sky-800 rounded"></div>
          </div>
        ));
      case "card":
        return Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-sky-200 dark:border-sky-700 p-4 mb-4 animate-pulse"
          >
            <div className="h-5 w-1/3 bg-sky-200 dark:bg-sky-800 rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-sky-200 dark:bg-sky-800 rounded"></div>
              <div className="h-4 w-5/6 bg-sky-200 dark:bg-sky-800 rounded"></div>
              <div className="h-4 w-3/4 bg-sky-200 dark:bg-sky-800 rounded"></div>
            </div>
          </div>
        ));
      case "image":
        return Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="rounded-md bg-sky-200 dark:bg-sky-800 aspect-square animate-pulse"
          ></div>
        ));
      case "text":
        return Array.from({ length: count }).map((_, index) => (
          <div key={index} className="space-y-2 animate-pulse">
            <div className="h-4 w-full bg-sky-200 dark:bg-sky-800 rounded"></div>
            <div className="h-4 w-[90%] bg-sky-200 dark:bg-sky-800 rounded"></div>
            <div className="h-4 w-[80%] bg-sky-200 dark:bg-sky-800 rounded"></div>
          </div>
        ));
      default:
        return Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-4 w-full rounded-sm bg-sky-200 dark:bg-sky-800 animate-pulse",
              className
            )}
            {...props}
          ></div>
        ));
    }
  };

  return <>{renderSkeleton()}</>;
}
