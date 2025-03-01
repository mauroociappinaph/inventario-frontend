'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/layout/page-transition';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Suspense } from 'react'
import { InventoryChart } from '@/components/inventory-chart'
import { InventoryAlerts } from '@/components/inventory-alerts'

export default function Home() {
  const router = useRouter();

  // Redirigir al dashboard o login según corresponda
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      router.push('/dashboard');
    }, 500);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <PageTransition
      transition={{ type: 'fade', duration: 0.5 }}
      className="flex items-center justify-center min-h-screen"
    >
      <div className="text-center">
        <LoadingSpinner size="lg" variant="primary" label="Redirigiendo..." showLabel={true} />
      </div>
    </PageTransition>
  );
}

