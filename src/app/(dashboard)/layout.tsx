import { UIStateProvider } from "@/providers/ui-state-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UIStateProvider>
      {children}
    </UIStateProvider>
  );
}
