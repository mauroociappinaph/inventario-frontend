"use client";

import NoSSR from "../components/no-ssr";
import Dashboard from "../components/dashboard";

export default function Home() {
  return (
    <NoSSR fallback={<div className="p-8 text-center">Cargando...</div>}>
      <Dashboard />
    </NoSSR>
  );
}

