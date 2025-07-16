import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen text-foreground font-body">
      <AppHeader />
      <main className="pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
