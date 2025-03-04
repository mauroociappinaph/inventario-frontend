"use client"

import { cn } from "@/lib/utils";
import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, type = "text", value, ...props }: InputProps) {
  console.log("Input value:", value);
  return (
    <input
      type={type}
      value={value ?? ""}
      className={cn(
        "flex h-10 w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-sm text-sky-800 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-sky-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:border-sky-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-700 dark:bg-sky-900/50 dark:text-sky-100 dark:placeholder:text-sky-400/60 dark:focus-visible:ring-sky-500",
        className
      )}
      {...props}
    />
  );
}
